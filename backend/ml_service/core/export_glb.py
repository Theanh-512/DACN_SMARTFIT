import os
import struct
import json
import logging
from typing import Optional, List, Tuple
import numpy as np
import trimesh

from core.body_model import BodyModel

logger = logging.getLogger("ml_service.export_glb")
logging.basicConfig(level=logging.INFO)

class GlbMorphExporter:
    """
    Exports a 3D Human Body Model in canonical A-Pose (with arms lowered 20 degrees)
    along with 10 Shape Morph Targets (shapedirs corresponding to betas 0..9).
    The resulting glTF 2.0 Binary (.glb) can be loaded directly by Three.js GLTFLoader
    and dynamically shaped in real-time on the GPU via mesh.morphTargetInfluences.
    """

    @classmethod
    def generate_morph_avatar_glb(
        cls,
        output_path: str,
        gender: str = "neutral",
        pose: str = "A-pose"
    ) -> str:
        """
        Builds canonical base humanoid mesh and 10 delta morph targets,
        packaging them into a standard glTF 2.0 binary (.glb) file.
        """
        os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)

        # 1. Resolve Gender Model
        model = BodyModel(gender=gender)
        if model.is_mock:
            logger.info(f"Using mock parametric model for GLB export ({gender}).")
        else:
            logger.info(f"Using official {model.model_type.upper()} model for GLB export ({gender}).")

        # 2. Generate Base Mesh V0 (betas = 0 in A-pose)
        verts_base, faces = model.build_mesh([0.0] * 10, pose=pose)
        num_verts = len(verts_base)

        # Compute smooth vertex normals
        temp_mesh = trimesh.Trimesh(vertices=verts_base, faces=faces, process=False)
        normals_base = temp_mesh.vertex_normals.astype(np.float32)

        # 3. Generate 10 Morph Target Deltas (each delta = V(beta_i = 1.0) - V0)
        target_deltas = []
        target_names = [
            "beta_0_mass",
            "beta_1_stature",
            "beta_2_chest",
            "beta_3_waist",
            "beta_4_hip",
            "beta_5_shoulder",
            "beta_6_arm_mass",
            "beta_7_torso_leg",
            "beta_8_head_neck",
            "beta_9_secondary"
        ]

        logger.info("Computing 10 morph target displacement deltas...")
        for i in range(10):
            betas_i = [0.0] * 10
            betas_i[i] = 1.0
            verts_i, _ = model.build_mesh(betas_i, pose=pose)
            delta_i = (verts_i - verts_base).astype(np.float32)
            target_deltas.append(delta_i)

        # 4. Pack into Binary GLB (glTF 2.0)
        bin_data = bytearray()

        def _add_to_bin(data_bytes: bytes) -> Tuple[int, int]:
            offset = len(bin_data)
            bin_data.extend(data_bytes)
            # 4-byte alignment
            pad = (4 - (len(bin_data) % 4)) % 4
            bin_data.extend(b"\x00" * pad)
            return offset, len(data_bytes)

        # BufferView 0: Base Positions (VEC3, FLOAT)
        pos_off, pos_len = _add_to_bin(verts_base.astype(np.float32).tobytes())
        # BufferView 1: Base Normals (VEC3, FLOAT)
        norm_off, norm_len = _add_to_bin(normals_base.tobytes())
        # BufferView 2: Triangle Indices (SCALAR, UNSIGNED_INT)
        faces_flat = faces.astype(np.uint32).flatten()
        idx_off, idx_len = _add_to_bin(faces_flat.tobytes())

        buffer_views = [
            {"buffer": 0, "byteOffset": pos_off, "byteLength": pos_len, "target": 34962},  # ARRAY_BUFFER
            {"buffer": 0, "byteOffset": norm_off, "byteLength": norm_len, "target": 34962},
            {"buffer": 0, "byteOffset": idx_off, "byteLength": idx_len, "target": 34963}   # ELEMENT_ARRAY_BUFFER
        ]

        accessors = [
            {
                "bufferView": 0,
                "byteOffset": 0,
                "componentType": 5126,  # FLOAT
                "count": num_verts,
                "type": "VEC3",
                "min": verts_base.min(axis=0).tolist(),
                "max": verts_base.max(axis=0).tolist()
            },
            {
                "bufferView": 1,
                "byteOffset": 0,
                "componentType": 5126,
                "count": num_verts,
                "type": "VEC3"
            },
            {
                "bufferView": 2,
                "byteOffset": 0,
                "componentType": 5125,  # UNSIGNED_INT
                "count": len(faces_flat),
                "type": "SCALAR"
            }
        ]

        # Morph targets
        targets = []
        for i, delta in enumerate(target_deltas):
            d_off, d_len = _add_to_bin(delta.tobytes())
            bv_idx = len(buffer_views)
            buffer_views.append({
                "buffer": 0,
                "byteOffset": d_off,
                "byteLength": d_len
            })
            acc_idx = len(accessors)
            accessors.append({
                "bufferView": bv_idx,
                "byteOffset": 0,
                "componentType": 5126,
                "count": num_verts,
                "type": "VEC3",
                "min": delta.min(axis=0).tolist(),
                "max": delta.max(axis=0).tolist()
            })
            targets.append({"POSITION": acc_idx})

        # Materials: PBR Skin Material
        materials = [
            {
                "name": "Skin_Material",
                "pbrMetallicRoughness": {
                    "baseColorFactor": [0.91, 0.76, 0.62, 1.0],  # Natural Asian/Warm skin
                    "metallicFactor": 0.05,
                    "roughnessFactor": 0.65
                },
                "doubleSided": True
            }
        ]

        gltf_manifest = {
            "asset": {
                "version": "2.0",
                "generator": "FashionAI Parametric SMPL-X GLB Exporter"
            },
            "scenes": [{"nodes": [0]}],
            "scene": 0,
            "nodes": [
                {
                    "mesh": 0,
                    "name": f"HumanoidAvatar_{gender}_{pose}"
                }
            ],
            "meshes": [
                {
                    "name": "AvatarMesh",
                    "primitives": [
                        {
                            "attributes": {
                                "POSITION": 0,
                                "NORMAL": 1
                            },
                            "indices": 2,
                            "material": 0,
                            "targets": targets
                        }
                    ],
                    "weights": [0.0] * 10,
                    "extras": {
                        "targetNames": target_names
                    }
                }
            ],
            "materials": materials,
            "accessors": accessors,
            "bufferViews": buffer_views,
            "buffers": [{"byteLength": len(bin_data)}]
        }

        # Encode JSON chunk
        json_bytes = json.dumps(gltf_manifest, ensure_ascii=False).encode("utf-8")
        pad_json = (4 - (len(json_bytes) % 4)) % 4
        json_bytes += b" " * pad_json

        # GLB Header (12 bytes)
        total_glb_len = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
        header = struct.pack("<4sII", b"glTF", 2, total_glb_len)
        json_chunk_header = struct.pack("<II", len(json_bytes), 0x4E4F534A)  # "JSON"
        bin_chunk_header = struct.pack("<II", len(bin_data), 0x004E4942)     # "BIN\0"

        with open(output_path, "wb") as f:
            f.write(header)
            f.write(json_chunk_header)
            f.write(json_bytes)
            f.write(bin_chunk_header)
            f.write(bin_data)

        logger.info(f"Successfully exported parametric morph avatar to '{output_path}' ({total_glb_len / 1024:.1f} KB)")
        return output_path
