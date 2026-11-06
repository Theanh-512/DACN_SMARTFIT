import os
import json
import logging
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import trimesh

logger = logging.getLogger("ml_service.body_rig")

# Standard 24 SMPL joint names
SMPL_JOINT_NAMES = [
    "pelvis",          # 0
    "left_hip",        # 1
    "right_hip",       # 2
    "spine1",          # 3
    "left_knee",       # 4
    "right_knee",      # 5
    "spine2",          # 6
    "left_ankle",      # 7
    "right_ankle",     # 8
    "spine3",          # 9
    "left_foot",       # 10
    "right_foot",      # 11
    "neck",            # 12
    "left_collar",     # 13
    "right_collar",    # 14
    "head",            # 15
    "left_shoulder",   # 16
    "right_shoulder",  # 17
    "left_elbow",      # 18
    "right_elbow",     # 19
    "left_wrist",      # 20
    "right_wrist",     # 21
    "left_hand",       # 22
    "right_hand"       # 23
]

SMPL_PARENTS = [-1, 0, 0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 12, 13, 14, 16, 17, 18, 19, 20, 21]

# Anatomical 3-axis rotation limits in degrees [min_x, max_x, min_y, max_y, min_z, max_z]
JOINT_LIMITS_DEG: Dict[str, Dict[str, List[float]]] = {
    "pelvis":         {"min": [-30.0, -45.0, -30.0], "max": [30.0, 45.0, 30.0]},
    "left_hip":       {"min": [-30.0, -20.0, -45.0], "max": [90.0, 20.0, 30.0]},
    "right_hip":      {"min": [-30.0, -20.0, -30.0], "max": [90.0, 20.0, 45.0]},
    "spine1":         {"min": [-15.0, -15.0, -15.0], "max": [25.0, 15.0, 15.0]},
    "left_knee":      {"min": [0.0, 0.0, 0.0],     "max": [140.0, 0.0, 0.0]},     # Hinge backward flexion only [0, 140] deg
    "right_knee":     {"min": [0.0, 0.0, 0.0],     "max": [140.0, 0.0, 0.0]},     # Hinge backward flexion only [0, 140] deg
    "spine2":         {"min": [-15.0, -15.0, -15.0], "max": [25.0, 15.0, 15.0]},
    "left_ankle":     {"min": [-40.0, -20.0, -20.0], "max": [30.0, 20.0, 20.0]},
    "right_ankle":    {"min": [-40.0, -20.0, -20.0], "max": [30.0, 20.0, 20.0]},
    "spine3":         {"min": [-15.0, -15.0, -15.0], "max": [25.0, 15.0, 15.0]},
    "left_foot":      {"min": [-20.0, -10.0, -10.0], "max": [20.0, 10.0, 10.0]},
    "right_foot":     {"min": [-20.0, -10.0, -10.0], "max": [20.0, 10.0, 10.0]},
    "neck":           {"min": [-30.0, -45.0, -30.0], "max": [40.0, 45.0, 30.0]},
    "left_collar":    {"min": [-10.0, -10.0, -15.0], "max": [15.0, 10.0, 15.0]},
    "right_collar":   {"min": [-10.0, -10.0, -15.0], "max": [15.0, 10.0, 15.0]},
    "head":           {"min": [-35.0, -50.0, -35.0], "max": [45.0, 50.0, 35.0]},
    "left_shoulder":  {"min": [-80.0, -70.0, -90.0], "max": [100.0, 70.0, 80.0]},
    "right_shoulder": {"min": [-80.0, -70.0, -80.0], "max": [100.0, 70.0, 90.0]},
    "left_elbow":     {"min": [0.0, -90.0, 0.0],     "max": [145.0, 90.0, 0.0]},  # Forearm flex
    "right_elbow":    {"min": [0.0, -90.0, 0.0],     "max": [145.0, 90.0, 0.0]},
    "left_wrist":     {"min": [-60.0, -20.0, -30.0], "max": [60.0, 20.0, 30.0]},
    "right_wrist":    {"min": [-60.0, -20.0, -30.0], "max": [60.0, 20.0, 30.0]},
    "left_hand":      {"min": [-15.0, -10.0, -10.0], "max": [15.0, 10.0, 10.0]},
    "right_hand":     {"min": [-15.0, -10.0, -10.0], "max": [15.0, 10.0, 10.0]}
}

class BodyRigEngine:
    """
    SMPL 24-Joint Skeletal Rigging, Sparse J-Regressor, Regional Morph,
    and Underwear Base Layer Engine for SmartFit Phase 3.6.
    """

    @staticmethod
    def extract_sparse_j_regressor(j_regressor: np.ndarray, tol: float = 1e-5) -> Dict[str, Any]:
        """
        Converts dense (24, V) joint regressor to compact sparse representation:
        { joint_id: [ [vertex_idx, weight], ... ] }
        """
        sparse_data: Dict[str, List[List[float]]] = {}
        for j in range(24):
            row = j_regressor[j]
            active_idx = np.where(np.abs(row) > tol)[0]
            entries = []
            for idx in active_idx:
                entries.append([int(idx), round(float(row[idx]), 6)])
            sparse_data[str(j)] = entries
        return sparse_data

    @staticmethod
    def extract_top4_skinning_weights(lbs_weights: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Extracts top 4 bone weights and indices per vertex for standard glTF 2.0 (JOINTS_0, WEIGHTS_0).
        Returns:
            joints: np.ndarray (V, 4) of uint16
            weights: np.ndarray (V, 4) of float32, normalized to sum to 1.0.
        """
        v_count = lbs_weights.shape[0]
        top4_idx = np.argsort(lbs_weights, axis=1)[:, -4:]
        top4_w = np.take_along_axis(lbs_weights, top4_idx, axis=1).astype(np.float32)

        # Normalize
        row_sums = top4_w.sum(axis=1, keepdims=True)
        row_sums[row_sums == 0] = 1.0
        top4_w /= row_sums

        return top4_idx.astype(np.uint16), top4_w.astype(np.float32)

    @staticmethod
    def compute_regional_morphs(
        vertices: np.ndarray,
        normals: np.ndarray,
        joints: np.ndarray
    ) -> Dict[str, np.ndarray]:
        """
        Computes 6 regional displacement morph deltas using anatomical anchor points
        and Gaussian body-space distance falloff.
        Completely independent of vertex count.
        """
        y_pelvis = float(joints[0, 1])
        y_spine1 = float(joints[3, 1])
        y_spine2 = float(joints[6, 1])
        y_spine3 = float(joints[9, 1])
        y_l_hip = float(joints[1, 1])
        y_l_knee = float(joints[4, 1])
        y_neck = float(joints[12, 1])

        morphs: Dict[str, np.ndarray] = {}

        # 1. Abdomen (Bụng)
        # Anchor at mid-belly anterior, decoupled from chest above
        y_abd = (y_pelvis + y_spine2) * 0.5
        d_y = np.where(
            vertices[:, 1] > y_abd,
            (vertices[:, 1] - y_abd) / 0.060,  # Sharper upward falloff towards chest
            (vertices[:, 1] - y_abd) / 0.110   # Gentle downward falloff towards pelvis
        )
        d_x = vertices[:, 0] / 0.14
        d_z = (vertices[:, 2] - 0.08) / 0.10
        falloff_abd = np.exp(-0.5 * (d_x**2 + d_y**2 + d_z**2))
        falloff_abd *= np.clip(normals[:, 2], 0.0, 1.0) # Anterior only
        amp_abd = 0.045 # max 4.5 cm push
        morphs["morph_abdomen"] = (normals * (amp_abd * falloff_abd[:, None])).astype(np.float32)

        # 2. Chest / Pectorals (Ngực)
        # Left and Right breasts/pectoral anchors, decoupled from waist below
        y_chest = y_spine3
        z_chest = 0.09
        d_y_c = np.where(
            vertices[:, 1] < y_chest,
            (vertices[:, 1] - y_chest) / 0.055,  # Sharper downward falloff towards waist
            (vertices[:, 1] - y_chest) / 0.080   # Gentle upward falloff towards clavicles
        )
        d_z_c = (vertices[:, 2] - z_chest) / 0.09
        d_x_l = (vertices[:, 0] - 0.10) / 0.08
        d_x_r = (vertices[:, 0] + 0.10) / 0.08
        falloff_chest = np.exp(-0.5 * (d_x_l**2 + d_y_c**2 + d_z_c**2)) + np.exp(-0.5 * (d_x_r**2 + d_y_c**2 + d_z_c**2))
        falloff_chest *= np.clip(normals[:, 2], 0.0, 1.0)
        amp_chest = 0.040
        morphs["morph_chest"] = (normals * (amp_chest * falloff_chest[:, None])).astype(np.float32)

        # 3. Biceps / Upper Arms (Bắp tay)
        # Left and right arm midpoint
        j_l_sh = joints[16]
        j_l_el = joints[18]
        j_r_sh = joints[17]
        j_r_el = joints[19]
        p_l_arm = (j_l_sh + j_l_el) * 0.5
        p_r_arm = (j_r_sh + j_r_el) * 0.5
        d_l_arm = np.linalg.norm(vertices - p_l_arm, axis=1) / 0.12
        d_r_arm = np.linalg.norm(vertices - p_r_arm, axis=1) / 0.12
        falloff_biceps = np.exp(-0.5 * d_l_arm**2) + np.exp(-0.5 * d_r_arm**2)
        amp_biceps = 0.025
        morphs["morph_biceps"] = (normals * (amp_biceps * falloff_biceps[:, None])).astype(np.float32)

        # 4. Thighs (Đùi)
        # Left and right thigh midpoint
        p_l_thigh = (joints[1] + joints[4]) * 0.5
        p_r_thigh = (joints[2] + joints[5]) * 0.5
        d_l_thigh = np.linalg.norm(vertices - p_l_thigh, axis=1) / 0.15
        d_r_thigh = np.linalg.norm(vertices - p_r_thigh, axis=1) / 0.15
        falloff_thighs = np.exp(-0.5 * d_l_thigh**2) + np.exp(-0.5 * d_r_thigh**2)
        amp_thighs = 0.035
        morphs["morph_thighs"] = (normals * (amp_thighs * falloff_thighs[:, None])).astype(np.float32)

        # 5. Buttocks (Mông)
        # Posterior pelvis
        y_butt = y_pelvis - 0.04
        z_butt = -0.10
        d_y_b = (vertices[:, 1] - y_butt) / 0.11
        d_z_b = (vertices[:, 2] - z_butt) / 0.10
        d_x_bl = (vertices[:, 0] - 0.09) / 0.09
        d_x_br = (vertices[:, 0] + 0.09) / 0.09
        falloff_butt = np.exp(-0.5 * (d_x_bl**2 + d_y_b**2 + d_z_b**2)) + np.exp(-0.5 * (d_x_br**2 + d_y_b**2 + d_z_b**2))
        falloff_butt *= np.clip(-normals[:, 2], 0.0, 1.0) # Posterior only
        amp_butt = 0.040
        morphs["morph_buttocks"] = (normals * (amp_butt * falloff_butt[:, None])).astype(np.float32)

        # 6. Shoulders (Vai - Lateral biacromial breadth expansion/narrowing)
        d_l_sh = np.linalg.norm(vertices - j_l_sh, axis=1) / 0.15
        d_r_sh = np.linalg.norm(vertices - j_r_sh, axis=1) / 0.15
        falloff_l_sh = np.exp(-0.5 * d_l_sh**2)
        falloff_r_sh = np.exp(-0.5 * d_r_sh**2)

        # Smooth taper towards sagittal midline (neck/sternum)
        midline_mask_l = np.clip((vertices[:, 0] - 0.05) / 0.08, 0.0, 1.0)
        midline_mask_r = np.clip((-vertices[:, 0] - 0.05) / 0.08, 0.0, 1.0)
        falloff_l_sh *= midline_mask_l
        falloff_r_sh *= midline_mask_r

        # Only upper torso / shoulder vertical band (Y > y_spine2)
        y_mask = np.clip((vertices[:, 1] - y_spine2) / 0.10, 0.0, 1.0)
        falloff_l_sh *= y_mask
        falloff_r_sh *= y_mask

        amp_sh = 0.035 # 3.5 cm lateral expansion per shoulder = 7 cm total span adjustment
        sh_disp = np.zeros_like(vertices, dtype=np.float32)
        # Lateral X expansion (left side +X, right side -X) + subtle deltoid normal lift
        sh_disp[:, 0] = amp_sh * (falloff_l_sh - falloff_r_sh)
        sh_disp[:, 1] = 0.25 * amp_sh * (falloff_l_sh + falloff_r_sh) * np.clip(normals[:, 1], 0.0, 1.0)
        sh_disp[:, 2] = 0.20 * amp_sh * (falloff_l_sh + falloff_r_sh) * normals[:, 2]
        morphs["morph_shoulders"] = sh_disp.astype(np.float32)

        return morphs

    @staticmethod
    def extract_underwear_submesh(
        vertices: np.ndarray,
        faces: np.ndarray,
        normals: np.ndarray,
        joints: np.ndarray,
        gender: str = "neutral",
        top4_joints: Optional[np.ndarray] = None,
        top4_weights: Optional[np.ndarray] = None,
        morph_deltas: Optional[List[np.ndarray]] = None,
        offset_distance: float = 0.0025 # 2.5 mm outward push
    ) -> Dict[str, Any]:
        """
        Extracts opaque neutral underwear base layer mesh conforming to body shape.
        Extruded outward by offset_distance along surface normals.
        Shares identical skeleton skinning weights and morph target displacement deltas.
        """
        y_pelvis = float(joints[0, 1])
        y_spine1 = float(joints[3, 1])
        y_spine2 = float(joints[6, 1])
        y_spine3 = float(joints[9, 1])
        y_l_hip = float(joints[1, 1])
        y_l_knee = float(joints[4, 1])

        # Briefs / Boxers region
        if gender.lower() == "male":
            # Boxer briefs: down to upper thigh
            bottom_min_y = y_l_knee + 0.18
            bottom_max_y = y_spine1 + 0.04
            bottom_x_limit = 0.22
        else:
            # Female / Neutral briefs
            bottom_min_y = y_l_hip - 0.10
            bottom_max_y = y_spine1 + 0.03
            bottom_x_limit = 0.20

        bottom_mask = (
            (vertices[:, 1] >= bottom_min_y) &
            (vertices[:, 1] <= bottom_max_y) &
            (np.abs(vertices[:, 0]) <= bottom_x_limit)
        )

        # Top / Bra region (Female & Neutral only)
        if gender.lower() in ["female", "neutral"]:
            top_min_y = y_spine2 - 0.05
            top_max_y = y_spine3 + 0.06
            top_mask = (
                (vertices[:, 1] >= top_min_y) &
                (vertices[:, 1] <= top_max_y) &
                (np.abs(vertices[:, 0]) <= 0.19)
            )
            underwear_v_mask = bottom_mask | top_mask
        else:
            underwear_v_mask = bottom_mask

        # Select faces where all 3 vertices belong to the underwear mask
        face_mask = underwear_v_mask[faces[:, 0]] & underwear_v_mask[faces[:, 1]] & underwear_v_mask[faces[:, 2]]
        sub_faces_orig = faces[face_mask]

        # Remap vertex indices to compact contiguous submesh
        used_v_indices = np.unique(sub_faces_orig)
        idx_map = np.full(len(vertices), -1, dtype=np.int32)
        idx_map[used_v_indices] = np.arange(len(used_v_indices))
        sub_faces = idx_map[sub_faces_orig].astype(np.int32)

        # Extrude outward by 2.5 mm along normals
        sub_vertices = (vertices[used_v_indices] + normals[used_v_indices] * offset_distance).astype(np.float32)
        sub_normals = normals[used_v_indices].astype(np.float32)

        result: Dict[str, Any] = {
            "vertices": sub_vertices,
            "faces": sub_faces,
            "normals": sub_normals,
            "vertex_indices": used_v_indices
        }

        if top4_joints is not None:
            result["joints"] = top4_joints[used_v_indices]
        if top4_weights is not None:
            result["weights"] = top4_weights[used_v_indices]
        if morph_deltas is not None:
            result["morph_deltas"] = [d[used_v_indices] for d in morph_deltas]

        return result
