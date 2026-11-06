import os
import struct
import json
import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
import trimesh
from scipy.spatial import cKDTree

from core.body_rig import SMPL_JOINT_NAMES, SMPL_PARENTS
from core.body_model import BodyModel

logger = logging.getLogger("ml_service.skinning_transfer")

class SkinningTransfer:
    """
    Transfers SMPL 24-joint skeletal skinning weights from human body mesh to 3D garment mesh.
    Exports rigged garment SkinnedMesh GLB for seamless Three.js pose synchronization.
    """

    @classmethod
    def transfer_skinning_weights(
        cls,
        garment_mesh: trimesh.Trimesh,
        body_mesh: trimesh.Trimesh,
        body_joints_idx: np.ndarray,
        body_weights: np.ndarray,
        k_neighbors: int = 4
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Transfers skin weights from body surface to garment using inverse-distance weighted k-NN.
        Returns:
            - g_joints: (N, 4) uint16 joint indices
            - g_weights: (N, 4) float32 weights normalized to sum to 1.0
        """
        tree = cKDTree(body_mesh.vertices)
        dists, idxs = tree.query(garment_mesh.vertices, k=k_neighbors)

        num_g_verts = len(garment_mesh.vertices)
        g_weights_24 = np.zeros((num_g_verts, 24), dtype=np.float32)

        # Inverse distance weights
        inv_dists = 1.0 / np.maximum(dists, 1e-4)
        norm_inv_dists = inv_dists / np.sum(inv_dists, axis=1, keepdims=True)

        for n_i in range(k_neighbors):
            body_vert_idxs = idxs[:, n_i] # (N,)
            b_j_idx = body_joints_idx[body_vert_idxs] # (N, 4)
            b_w = body_weights[body_vert_idxs]       # (N, 4)
            w_weight = norm_inv_dists[:, n_i, None]  # (N, 1)

            for b_k in range(4):
                joints_k = b_j_idx[:, b_k]
                weights_k = b_w[:, b_k] * w_weight[:, 0]
                np.add.at(g_weights_24, (np.arange(num_g_verts), joints_k), weights_k)

        # Select Top-4 bones per vertex
        top4_idx = np.argsort(g_weights_24, axis=1)[:, -4:]
        top4_w = np.take_along_axis(g_weights_24, top4_idx, axis=1)

        # Normalize sum to 1.0
        row_sums = top4_w.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1.0
        top4_w /= row_sums

        return top4_idx.astype(np.uint16), top4_w.astype(np.float32)

    @classmethod
    def export_skinned_garment_glb(
        cls,
        garment_mesh: trimesh.Trimesh,
        output_glb_path: str,
        gender: str = "neutral",
        garment_name: str = "3D_Garment"
    ) -> str:
        """
        Exports garment mesh as a standard glTF 2.0 Binary SkinnedMesh (.glb)
        with 24 SMPL joint armature nodes and inverse bind matrices matching the avatar.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_glb_path)), exist_ok=True)
        model = BodyModel(gender=gender)
        b_verts, b_faces = model.build_mesh([0.0] * 10, pose="T-pose")
        b_mesh = trimesh.Trimesh(vertices=b_verts, faces=b_faces, process=False)

        # Extract body skinning
        if not model.is_mock and model.torch_model is not None:
            lbs_w = model.torch_model.lbs_weights.detach().cpu().numpy()
            j_reg = model.torch_model.J_regressor.detach().cpu().numpy()
            J0 = j_reg @ b_verts
        else:
            lbs_w = np.zeros((len(b_verts), 24), dtype=np.float32)
            lbs_w[:, 0] = 1.0
            J0 = np.zeros((24, 3), dtype=np.float32)

        # Top 4 body skinning
        top4_body_idx = np.argsort(lbs_w, axis=1)[:, -4:]
        top4_body_w = np.take_along_axis(lbs_w, top4_body_idx, axis=1)
        r_sum = top4_body_w.sum(axis=1, keepdims=True)
        r_sum[r_sum == 0] = 1.0
        top4_body_w /= r_sum

        # Transfer to garment
        g_joints, g_weights = cls.transfer_skinning_weights(
            garment_mesh=garment_mesh,
            body_mesh=b_mesh,
            body_joints_idx=top4_body_idx.astype(np.uint16),
            body_weights=top4_body_w.astype(np.float32)
        )

        # Compute Inverse Bind Matrices (IBMs)
        # 4x4 matrix per joint: translation -J0
        ibms = np.zeros((24, 4, 4), dtype=np.float32)
        for j in range(24):
            ibms[j] = np.eye(4, dtype=np.float32)
            ibms[j, :3, 3] = -J0[j]

        # Build GLTF binary payload
        g_verts = garment_mesh.vertices.astype(np.float32)
        g_norms = garment_mesh.vertex_normals.astype(np.float32)
        g_faces = garment_mesh.faces.astype(np.uint32)

        # Compute normalized planar UVs for texture mapping
        u_span = max(1e-5, float(g_verts[:, 0].max() - g_verts[:, 0].min()))
        v_span = max(1e-5, float(g_verts[:, 1].max() - g_verts[:, 1].min()))
        u = (g_verts[:, 0] - g_verts[:, 0].min()) / u_span
        v = (g_verts[:, 1] - g_verts[:, 1].min()) / v_span
        g_uvs = np.column_stack([u, v]).astype(np.float32)

        bin_chunks = bytearray()

        def add_buffer(data: bytes, align: int = 4) -> Tuple[int, int]:
            while len(bin_chunks) % align != 0:
                bin_chunks.extend(b"\x00")
            offset = len(bin_chunks)
            bin_chunks.extend(data)
            return offset, len(data)

        off_pos, len_pos = add_buffer(g_verts.tobytes())
        off_norm, len_norm = add_buffer(g_norms.tobytes())
        off_joints, len_joints = add_buffer(g_joints.tobytes())
        off_weights, len_weights = add_buffer(g_weights.tobytes())
        off_idx, len_idx = add_buffer(g_faces.flatten().tobytes())
        off_ibm, len_ibm = add_buffer(ibms.tobytes())
        off_uv, len_uv = add_buffer(g_uvs.tobytes())

        # Build JSON header
        nodes = []
        # Armature Root
        nodes.append({"name": "Armature", "children": [1]})
        # 24 joint nodes
        for j in range(24):
            children = [c + 1 for c in range(24) if SMPL_PARENTS[c] == j]
            p = SMPL_PARENTS[j]
            if p == -1:
                t = J0[j].tolist()
            else:
                t = (J0[j] - J0[p]).tolist()

            node_def: Dict[str, Any] = {
                "name": f"SMPL_{SMPL_JOINT_NAMES[j]}",
                "translation": [float(x) for x in t]
            }
            if children:
                node_def["children"] = children
            nodes.append(node_def)

        # SkinnedMesh Node
        mesh_node_idx = len(nodes)
        nodes.append({
            "name": garment_name,
            "mesh": 0,
            "skin": 0
        })

        nodes[0]["children"].append(mesh_node_idx)

        buffer_views = [
            {"buffer": 0, "byteOffset": off_pos, "byteLength": len_pos, "target": 34962},
            {"buffer": 0, "byteOffset": off_norm, "byteLength": len_norm, "target": 34962},
            {"buffer": 0, "byteOffset": off_joints, "byteLength": len_joints, "target": 34962},
            {"buffer": 0, "byteOffset": off_weights, "byteLength": len_weights, "target": 34962},
            {"buffer": 0, "byteOffset": off_idx, "byteLength": len_idx, "target": 34963},
            {"buffer": 0, "byteOffset": off_ibm, "byteLength": len_ibm},
            {"buffer": 0, "byteOffset": off_uv, "byteLength": len_uv, "target": 34962}
        ]

        accessors = [
            # 0: POSITION
            {
                "bufferView": 0, "componentType": 5126, "count": len(g_verts), "type": "VEC3",
                "min": [float(x) for x in g_verts.min(axis=0)],
                "max": [float(x) for x in g_verts.max(axis=0)]
            },
            # 1: NORMAL
            {"bufferView": 1, "componentType": 5126, "count": len(g_norms), "type": "VEC3"},
            # 2: JOINTS_0
            {"bufferView": 2, "componentType": 5123, "count": len(g_joints), "type": "VEC4"},
            # 3: WEIGHTS_0
            {"bufferView": 3, "componentType": 5126, "count": len(g_weights), "type": "VEC4"},
            # 4: INDICES
            {"bufferView": 4, "componentType": 5125, "count": len(g_faces) * 3, "type": "SCALAR"},
            # 5: IBMs
            {"bufferView": 5, "componentType": 5126, "count": 24, "type": "MAT4"},
            # 6: TEXCOORD_0
            {"bufferView": 6, "componentType": 5126, "count": len(g_uvs), "type": "VEC2"}
        ]

        # Extract PBR color
        color_rgba = [0.10, 0.16, 0.30, 1.0]
        if hasattr(garment_mesh, "visual") and hasattr(garment_mesh.visual, "vertex_colors"):
            vc = garment_mesh.visual.vertex_colors
            if len(vc) > 0:
                color_rgba = [float(vc[0, 0]) / 255.0, float(vc[0, 1]) / 255.0, float(vc[0, 2]) / 255.0, 1.0]

        materials = [{
            "name": "GarmentMaterial",
            "pbrMetallicRoughness": {
                "baseColorFactor": color_rgba,
                "metallicFactor": 0.05,
                "roughnessFactor": 0.85
            },
            "doubleSided": True
        }]

        meshes = [{
            "name": garment_name,
            "primitives": [{
                "attributes": {
                    "POSITION": 0,
                    "NORMAL": 1,
                    "JOINTS_0": 2,
                    "WEIGHTS_0": 3,
                    "TEXCOORD_0": 6
                },
                "indices": 4,
                "material": 0,
                "mode": 4
            }]
        }]

        skins = [{
            "inverseBindMatrices": 5,
            "joints": list(range(1, 25)),
            "skeleton": 0
        }]

        gltf_dict = {
            "asset": {"version": "2.0", "generator": "SmartFit_Phase4_Skinning_Transfer"},
            "scene": 0,
            "scenes": [{"nodes": [0]}],
            "nodes": nodes,
            "meshes": meshes,
            "skins": skins,
            "materials": materials,
            "accessors": accessors,
            "bufferViews": buffer_views,
            "buffers": [{"byteLength": len(bin_chunks)}]
        }

        # Pack GLB
        json_bytes = json.dumps(gltf_dict).encode("utf-8")
        while len(json_bytes) % 4 != 0:
            json_bytes += b" "

        while len(bin_chunks) % 4 != 0:
            bin_chunks.extend(b"\x00")

        total_size = 12 + 8 + len(json_bytes) + 8 + len(bin_chunks)
        header = struct.pack("<4sII", b"glTF", 2, total_size)
        json_chunk_hdr = struct.pack("<II", len(json_bytes), 0x4E4F534A)
        bin_chunk_hdr = struct.pack("<II", len(bin_chunks), 0x004E4942)

        with open(output_glb_path, "wb") as f:
            f.write(header)
            f.write(json_chunk_hdr)
            f.write(json_bytes)
            f.write(bin_chunk_hdr)
            f.write(bin_chunks)

        logger.info(f"Successfully exported rigged garment GLB: {output_glb_path} ({os.path.getsize(output_glb_path)/1024:.1f} KB)")
        return output_glb_path
