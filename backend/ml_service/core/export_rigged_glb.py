import os
import struct
import json
import logging
from typing import Optional, List, Tuple, Dict, Any
import numpy as np
import trimesh

from core.body_model import BodyModel
from core.body_rig import BodyRigEngine, SMPL_JOINT_NAMES, SMPL_PARENTS, JOINT_LIMITS_DEG

logger = logging.getLogger("ml_service.export_rigged_glb")
logging.basicConfig(level=logging.INFO)

class GlbRiggedExporter:
    """
    Exports a 3D Human Body Model in canonical Rest T-Pose with:
    - Complete 24-joint SMPL Skeletal Rig (hierarchical nodes, skin weights, inverse bind matrices).
    - 16 Morph Targets (10 SMPL Betas + 6 Regional Morphs: abdomen, chest, biceps, thighs, buttocks, shoulders).
    - Integrated Underwear Base Layer (Bikini top + briefs for female/neutral; Boxer briefs for male)
      sharing the same skeleton skinning and morph target deformations.
    - Sparse Joint Regressor JSON for dynamic client-side joint position updates when shape changes.
    """

    TARGET_NAMES = [
        "beta_0_mass",
        "beta_1_stature",
        "beta_2_chest",
        "beta_3_waist",
        "beta_4_hip",
        "beta_5_shoulder",
        "beta_6_arm_mass",
        "beta_7_torso_leg",
        "beta_8_head_neck",
        "beta_9_secondary",
        "morph_abdomen",
        "morph_chest",
        "morph_biceps",
        "morph_thighs",
        "morph_buttocks",
        "morph_shoulders"
    ]

    @classmethod
    def generate_rigged_avatar_glb(
        cls,
        output_glb_path: str,
        output_regressor_json_path: Optional[str] = None,
        gender: str = "neutral"
    ) -> Dict[str, Any]:
        """
        Builds the rigged avatar with skeleton, morph targets, and underwear base layer,
        packaging into standard glTF 2.0 Binary (.glb).
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_glb_path)), exist_ok=True)
        gender_clean = gender.lower().strip()

        # 1. Initialize BodyModel in Rest T-Pose
        model = BodyModel(gender=gender_clean)
        verts_base, faces = model.build_mesh([0.0] * 10, pose="T-pose")
        num_verts = len(verts_base)
        temp_mesh = trimesh.Trimesh(vertices=verts_base, faces=faces, process=False)
        normals_base = temp_mesh.vertex_normals.astype(np.float32)

        # 2. Extract Skeleton Rigging & Weights
        if not model.is_mock and model.torch_model is not None:
            tm = model.torch_model
            lbs_w = tm.lbs_weights.detach().cpu().numpy()
            jr_matrix = tm.J_regressor.detach().cpu().numpy()
        else:
            # Parametric fallback for mock model
            logger.info("Generating parametric synthetic skeleton and weights for mock model.")
            lbs_w = np.zeros((num_verts, 24), dtype=np.float32)
            lbs_w[:, 0] = 1.0 # default to root
            jr_matrix = np.zeros((24, num_verts), dtype=np.float32)

        # Joint rest locations J0
        J0 = jr_matrix @ verts_base # (24, 3)
        sparse_jr = BodyRigEngine.extract_sparse_j_regressor(jr_matrix)
        top4_joints, top4_weights = BodyRigEngine.extract_top4_skinning_weights(lbs_w)

        # 3. Compute 10 Beta Morph Targets
        morph_deltas: List[np.ndarray] = []
        for i in range(10):
            betas_i = [0.0] * 10
            betas_i[i] = 1.0
            v_i, _ = model.build_mesh(betas_i, pose="T-pose")
            delta_i = (v_i - verts_base).astype(np.float32)
            morph_deltas.append(delta_i)

        # 4. Compute 6 Regional Morph Targets
        regional_morphs = BodyRigEngine.compute_regional_morphs(verts_base, normals_base, J0)
        for r_name in [
            "morph_abdomen", "morph_chest", "morph_biceps",
            "morph_thighs", "morph_buttocks", "morph_shoulders"
        ]:
            morph_deltas.append(regional_morphs[r_name])

        # 5. Extract Underwear Base Layer Submesh
        uw = BodyRigEngine.extract_underwear_submesh(
            vertices=verts_base,
            faces=faces,
            normals=normals_base,
            joints=J0,
            gender=gender_clean,
            top4_joints=top4_joints,
            top4_weights=top4_weights,
            morph_deltas=morph_deltas,
            offset_distance=0.0025 # 2.5 mm outward offset
        )

        # 6. Build glTF 2.0 Binary Bundle
        bin_data = bytearray()
        buffer_views: List[Dict[str, Any]] = []
        accessors: List[Dict[str, Any]] = []

        def _add_bytes(raw_bytes: bytes, target: Optional[int] = None) -> int:
            offset = len(bin_data)
            bin_data.extend(raw_bytes)
            length = len(raw_bytes)
            pad = (4 - (length % 4)) % 4
            bin_data.extend(b"\x00" * pad)

            bv_idx = len(buffer_views)
            bv_dict: Dict[str, Any] = {"buffer": 0, "byteOffset": offset, "byteLength": length}
            if target is not None:
                bv_dict["target"] = target
            buffer_views.append(bv_dict)
            return bv_idx

        def _add_accessor(
            bv_idx: int,
            comp_type: int,
            count: int,
            acc_type: str,
            min_val: Optional[List[float]] = None,
            max_val: Optional[List[float]] = None
        ) -> int:
            acc_idx = len(accessors)
            acc: Dict[str, Any] = {
                "bufferView": bv_idx,
                "byteOffset": 0,
                "componentType": comp_type,
                "count": count,
                "type": acc_type
            }
            if min_val is not None:
                acc["min"] = min_val
            if max_val is not None:
                acc["max"] = max_val
            accessors.append(acc)
            return acc_idx

        # A. Inverse Bind Matrices Accessor (24 MAT4 matrices)
        # In T-pose with identity rotation, inverse bind matrix for joint i is Translation(-J0[i])
        ibm_matrices = np.zeros((24, 4, 4), dtype=np.float32)
        for i in range(24):
            ibm_matrices[i] = np.eye(4, dtype=np.float32)
            ibm_matrices[i, 3, :3] = -J0[i] # column-major translation in element (3, 0..2)
        ibm_bv = _add_bytes(ibm_matrices.tobytes())
        ibm_acc = _add_accessor(ibm_bv, 5126, 24, "MAT4") # FLOAT, MAT4

        # B. Body Geometry Accessors
        # Positions (5126 = FLOAT, VEC3)
        pos_min = [float(x) for x in np.min(verts_base, axis=0)]
        pos_max = [float(x) for x in np.max(verts_base, axis=0)]
        body_pos_bv = _add_bytes(verts_base.astype(np.float32).tobytes(), 34962) # ARRAY_BUFFER
        body_pos_acc = _add_accessor(body_pos_bv, 5126, num_verts, "VEC3", pos_min, pos_max)

        # Normals
        body_norm_bv = _add_bytes(normals_base.astype(np.float32).tobytes(), 34962)
        body_norm_acc = _add_accessor(body_norm_bv, 5126, num_verts, "VEC3")

        # Joints (5123 = UNSIGNED_SHORT, VEC4)
        body_j_bv = _add_bytes(top4_joints.tobytes(), 34962)
        body_j_acc = _add_accessor(body_j_bv, 5123, num_verts, "VEC4")

        # Weights (5126 = FLOAT, VEC4)
        body_w_bv = _add_bytes(top4_weights.tobytes(), 34962)
        body_w_acc = _add_accessor(body_w_bv, 5126, num_verts, "VEC4")

        # Faces / Indices (5125 = UNSIGNED_INT, SCALAR)
        faces_flat = faces.astype(np.uint32).flatten()
        body_idx_bv = _add_bytes(faces_flat.tobytes(), 34963) # ELEMENT_ARRAY_BUFFER
        body_idx_acc = _add_accessor(body_idx_bv, 5125, len(faces_flat), "SCALAR")

        # Body Morph Targets (16 targets)
        body_target_accs = []
        for delta in morph_deltas:
            d_min = [float(x) for x in np.min(delta, axis=0)]
            d_max = [float(x) for x in np.max(delta, axis=0)]
            d_bv = _add_bytes(delta.astype(np.float32).tobytes(), 34962)
            d_acc = _add_accessor(d_bv, 5126, num_verts, "VEC3", d_min, d_max)
            body_target_accs.append({"POSITION": d_acc})

        # C. Underwear Geometry Accessors
        uw_num_v = len(uw["vertices"])
        uw_num_f = len(uw["faces"])

        uw_pos_min = [float(x) for x in np.min(uw["vertices"], axis=0)]
        uw_pos_max = [float(x) for x in np.max(uw["vertices"], axis=0)]
        uw_pos_bv = _add_bytes(uw["vertices"].astype(np.float32).tobytes(), 34962)
        uw_pos_acc = _add_accessor(uw_pos_bv, 5126, uw_num_v, "VEC3", uw_pos_min, uw_pos_max)

        uw_norm_bv = _add_bytes(uw["normals"].astype(np.float32).tobytes(), 34962)
        uw_norm_acc = _add_accessor(uw_norm_bv, 5126, uw_num_v, "VEC3")

        uw_j_bv = _add_bytes(uw["joints"].astype(np.uint16).tobytes(), 34962)
        uw_j_acc = _add_accessor(uw_j_bv, 5123, uw_num_v, "VEC4")

        uw_w_bv = _add_bytes(uw["weights"].astype(np.float32).tobytes(), 34962)
        uw_w_acc = _add_accessor(uw_w_bv, 5126, uw_num_v, "VEC4")

        uw_faces_flat = uw["faces"].astype(np.uint32).flatten()
        uw_idx_bv = _add_bytes(uw_faces_flat.tobytes(), 34963)
        uw_idx_acc = _add_accessor(uw_idx_bv, 5125, len(uw_faces_flat), "SCALAR")

        # Underwear Morph Targets
        uw_target_accs = []
        for delta in uw["morph_deltas"]:
            d_min = [float(x) for x in np.min(delta, axis=0)]
            d_max = [float(x) for x in np.max(delta, axis=0)]
            d_bv = _add_bytes(delta.astype(np.float32).tobytes(), 34962)
            d_acc = _add_accessor(d_bv, 5126, uw_num_v, "VEC3", d_min, d_max)
            uw_target_accs.append({"POSITION": d_acc})

        # D. Assemble glTF Node Hierarchy
        # Nodes:
        # Node 0: "Armature" (Root node) -> children = [1 (Pelvis), 25 (Body), 26 (Underwear)]
        # Nodes 1..24: 24 Bones (SMPL Joints 0..23)
        # Node 25: Body SkinnedMesh
        # Node 26: Underwear SkinnedMesh

        # Compute children for each joint in SMPL tree
        joint_children: Dict[int, List[int]] = {i: [] for i in range(24)}
        for child_idx, parent_idx in enumerate(SMPL_PARENTS):
            if parent_idx >= 0:
                joint_children[parent_idx].append(child_idx)

        nodes: List[Dict[str, Any]] = []

        # Node 0: Root Armature
        nodes.append({
            "name": "Armature",
            "children": [1, 25, 26] # Pelvis bone + 2 SkinnedMeshes
        })

        # Nodes 1..24: Bones
        for i in range(24):
            parent_idx = SMPL_PARENTS[i]
            if parent_idx < 0:
                # Root joint: translation is world position J0[0]
                trans = [round(float(c), 6) for c in J0[0]]
            else:
                # Child joint: translation relative to parent J0[parent]
                trans = [round(float(c), 6) for c in (J0[i] - J0[parent_idx])]

            bone_node: Dict[str, Any] = {
                "name": SMPL_JOINT_NAMES[i],
                "translation": trans
            }
            if joint_children[i]:
                bone_node["children"] = [1 + c for c in joint_children[i]]

            nodes.append(bone_node)

        # Node 25: Body SkinnedMesh
        nodes.append({
            "name": "SMPL_Body",
            "mesh": 0,
            "skin": 0
        })

        # Node 26: Underwear SkinnedMesh
        nodes.append({
            "name": "SMPL_Underwear",
            "mesh": 1,
            "skin": 0
        })

        # E. Skin Definition
        # Joints are nodes 1..24
        skin = {
            "name": "SMPL_Skeleton",
            "inverseBindMatrices": ibm_acc,
            "joints": list(range(1, 25)),
            "skeleton": 1 # Root joint node index
        }

        # F. Meshes
        skin_color = [0.86, 0.74, 0.65, 1.0] if gender_clean != "female" else [0.88, 0.76, 0.68, 1.0]
        meshes = [
            # Mesh 0: Body
            {
                "name": "SMPL_Body_Mesh",
                "primitives": [{
                    "attributes": {
                        "POSITION": body_pos_acc,
                        "NORMAL": body_norm_acc,
                        "JOINTS_0": body_j_acc,
                        "WEIGHTS_0": body_w_acc
                    },
                    "indices": body_idx_acc,
                    "targets": body_target_accs,
                    "material": 0
                }],
                "extras": {"targetNames": cls.TARGET_NAMES}
            },
            # Mesh 1: Underwear
            {
                "name": "SMPL_Underwear_Mesh",
                "primitives": [{
                    "attributes": {
                        "POSITION": uw_pos_acc,
                        "NORMAL": uw_norm_acc,
                        "JOINTS_0": uw_j_acc,
                        "WEIGHTS_0": uw_w_acc
                    },
                    "indices": uw_idx_acc,
                    "targets": uw_target_accs,
                    "material": 1
                }],
                "extras": {"targetNames": cls.TARGET_NAMES}
            }
        ]

        # G. Materials
        materials = [
            # Body Material
            {
                "name": "BodySkinMaterial",
                "pbrMetallicRoughness": {
                    "baseColorFactor": skin_color,
                    "roughnessFactor": 0.60,
                    "metallicFactor": 0.02
                },
                "doubleSided": False
            },
            # Underwear Material
            {
                "name": "UnderwearFabricMaterial",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [0.93, 0.93, 0.95, 1.0],
                    "roughnessFactor": 0.85,
                    "metallicFactor": 0.05
                },
                "doubleSided": True
            }
        ]

        # Assemble glTF JSON object
        gltf_dict: Dict[str, Any] = {
            "asset": {
                "version": "2.0",
                "generator": "SmartFit Phase 3.6 GlbRiggedExporter"
            },
            "scene": 0,
            "scenes": [{"name": "DefaultScene", "nodes": [0]}],
            "nodes": nodes,
            "skins": [skin],
            "meshes": meshes,
            "materials": materials,
            "accessors": accessors,
            "bufferViews": buffer_views,
            "buffers": [{"byteLength": len(bin_data)}]
        }

        # Pack GLB
        json_bytes = json.dumps(gltf_dict, separators=(",", ":")).encode("utf-8")
        json_pad = (4 - (len(json_bytes) % 4)) % 4
        json_bytes += b" " * json_pad

        bin_pad = (4 - (len(bin_data) % 4)) % 4
        bin_data.extend(b"\x00" * bin_pad)

        total_length = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
        header = struct.pack("<4sII", b"glTF", 2, total_length)
        chunk0_hdr = struct.pack("<II", len(json_bytes), 0x4E4F534A) # JSON
        chunk1_hdr = struct.pack("<II", len(bin_data), 0x004E4942)   # BIN

        with open(output_glb_path, "wb") as f:
            f.write(header)
            f.write(chunk0_hdr)
            f.write(json_bytes)
            f.write(chunk1_hdr)
            f.write(bin_data)

        logger.info(f"Successfully generated rigged GLB ({gender_clean}): '{output_glb_path}' ({total_length / 1024:.1f} KB)")

        # Export Sparse J-Regressor & Joint Limits JSON
        regressor_payload = {
            "gender": gender_clean,
            "joint_names": SMPL_JOINT_NAMES,
            "parents": SMPL_PARENTS,
            "joint_limits_deg": JOINT_LIMITS_DEG,
            "rest_joints_t_pose": [[round(float(c), 6) for c in J0[j]] for j in range(24)],
            "sparse_j_regressor": sparse_jr,
            "target_names": cls.TARGET_NAMES,
            "num_body_vertices": num_verts,
            "num_underwear_vertices": uw_num_v
        }

        if output_regressor_json_path:
            os.makedirs(os.path.dirname(os.path.abspath(output_regressor_json_path)), exist_ok=True)
            with open(output_regressor_json_path, "w", encoding="utf-8") as f:
                json.dump(regressor_payload, f, indent=2, ensure_ascii=False)
            logger.info(f"Exported sparse J-regressor payload: '{output_regressor_json_path}'")

        return regressor_payload
