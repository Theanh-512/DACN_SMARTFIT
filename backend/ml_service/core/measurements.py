import logging
from typing import Dict, Any, Union, Tuple, Optional
import numpy as np
import trimesh
from scipy.spatial import ConvexHull

logger = logging.getLogger("ml_service.measurements")

class BodyMeasurements:
    """
    Extracts ISO 8559 garment anthropometric measurements from 3D humanoid mesh.
    Uses horizontal cross-sectional slicing and 2D convex hull perimeter calculation.
    Determines landmark positions strictly by anatomical height ratios and joint landmarks,
    never by mock mesh vertex IDs.
    All outputs are in centimeters (cm).
    """

    @classmethod
    def calculate_slice_perimeter(
        cls,
        mesh: trimesh.Trimesh,
        y_height: float,
        x_limit: Optional[float] = None
    ) -> float:
        """
        Intersects the mesh with a horizontal plane at y=y_height,
        computes the convex hull of the 2D cross-section on the X-Z plane,
        and returns the perimeter in centimeters.
        """
        try:
            # Slicing with horizontal plane (normal = [0, 1, 0])
            slice_segments = trimesh.intersections.mesh_plane(
                mesh,
                plane_normal=[0.0, 1.0, 0.0],
                plane_origin=[0.0, y_height, 0.0]
            )

            if slice_segments is None or len(slice_segments) == 0:
                return 0.0

            # Extract 2D points on X-Z plane
            pts_2d = slice_segments[:, :, [0, 2]].reshape(-1, 2)

            # Optional filter by X extent (isolates torso from outstretched or angled arms)
            if x_limit is not None:
                pts_2d = pts_2d[np.abs(pts_2d[:, 0]) <= x_limit]

            if len(pts_2d) < 3:
                return 0.0

            # Calculate Convex Hull
            hull = ConvexHull(pts_2d)
            hull_pts = pts_2d[hull.vertices]

            # Perimeter = sum of segment lengths between consecutive vertices
            diffs = hull_pts - np.roll(hull_pts, shift=-1, axis=0)
            perimeter_m = np.sum(np.sqrt(np.sum(diffs ** 2, axis=1)))
            return float(perimeter_m * 100.0)
        except Exception as e:
            logger.debug(f"Slice perimeter calculation fallback at y={y_height:.2f}: {e}")
            return 0.0

    @classmethod
    def extract_from_mesh(
        cls,
        mesh_or_verts: Union[trimesh.Trimesh, Tuple[np.ndarray, np.ndarray], np.ndarray],
        faces: Optional[np.ndarray] = None,
        joints: Optional[np.ndarray] = None
    ) -> Dict[str, float]:
        """
        Extracts all standard apparel anthropometric measurements from a 3D mesh:
        - height_cm: Total stature (head vertex to sole)
        - chest_cm: Bust / chest circumference (cm)
        - waist_cm: Waist / abdominal circumference (cm)
        - hip_cm: Hip circumference (gluteal prominence) (cm)
        - shoulder_cm: Across shoulder breadth (acromion to acromion) (cm)
        - arm_length_cm: Arm length from shoulder to wrist (cm)
        - torso_length_cm: Torso length from neck base to crotch (cm)
        """
        if isinstance(mesh_or_verts, trimesh.Trimesh):
            mesh = mesh_or_verts
            verts = mesh.vertices
        elif isinstance(mesh_or_verts, tuple):
            verts, f = mesh_or_verts
            mesh = trimesh.Trimesh(vertices=verts, faces=f, process=False)
        else:
            verts = mesh_or_verts
            if faces is None:
                raise ValueError("Faces must be provided when mesh_or_verts is an ndarray")
            mesh = trimesh.Trimesh(vertices=verts, faces=faces, process=False)

        y_min = float(np.min(verts[:, 1]))
        y_max = float(np.max(verts[:, 1]))
        total_height_m = max(0.5, y_max - y_min)
        height_cm = round(total_height_m * 100.0, 1)

        # Scale factor relative to standard adult stature 1.72m
        scale_ref = total_height_m / 1.72
        torso_x_limit = 0.26 * scale_ref

        # 1. Chest Girth (apex of chest / lower underarm line at ~70.0% of stature)
        y_chest = y_min + 0.700 * total_height_m
        chest_cm = cls.calculate_slice_perimeter(mesh, y_chest, x_limit=torso_x_limit)
        if chest_cm <= 10.0:
            chest_cm = cls.calculate_slice_perimeter(mesh, y_chest - 0.02, x_limit=torso_x_limit)
        if chest_cm <= 10.0:
            chest_cm = round(total_height_m * 54.0, 1)
        chest_cm = round(chest_cm, 1)

        # 2. Waist Girth (natural waist: narrowest torso section between 59% and 62.5% of stature)
        waist_slices = [
            cls.calculate_slice_perimeter(mesh, y_min + r * total_height_m, x_limit=torso_x_limit)
            for r in [0.590, 0.605, 0.615, 0.625]
        ]
        valid_waists = [w for w in waist_slices if w > 15.0]
        if valid_waists:
            waist_cm = round(min(valid_waists), 1)
        else:
            waist_cm = round(chest_cm * 0.86, 1)

        # 3. Hip Girth (gluteal / trochanter prominence: maximal perimeter between 49% and 53% of stature)
        hip_slices = [
            cls.calculate_slice_perimeter(mesh, y_min + r * total_height_m, x_limit=torso_x_limit)
            for r in [0.490, 0.505, 0.515, 0.525]
        ]
        valid_hips = [hp for hp in hip_slices if hp > 15.0]
        if valid_hips:
            hip_cm = round(max(valid_hips), 1)
        else:
            hip_cm = round(chest_cm * 1.05, 1)

        # 4. Across Shoulder Breadth (Biacromial breadth at ~80.8% of stature)
        if joints is not None and len(joints) >= 18:
            # Distance between shoulder joint 16 and 17 + deltoid cap margins
            j_sh_dist = np.linalg.norm(joints[16] - joints[17])
            shoulder_cm = round((j_sh_dist + 0.08) * 100.0, 1)
        else:
            y_shoulder = y_min + 0.808 * total_height_m
            shoulder_band = verts[np.abs(verts[:, 1] - y_shoulder) < 0.035]
            if len(shoulder_band) > 0:
                # Filter lateral points within shoulder envelope
                sh_pts = shoulder_band[np.abs(shoulder_band[:, 0]) <= 0.25 * scale_ref]
                if len(sh_pts) > 0:
                    sh_width_m = np.max(sh_pts[:, 0]) - np.min(sh_pts[:, 0])
                    shoulder_cm = round(sh_width_m * 100.0, 1)
                else:
                    shoulder_cm = round(total_height_m * 24.5, 1)
            else:
                shoulder_cm = round(total_height_m * 24.5, 1)

        # 5. Arm Length (Shoulder / acromion to wrist)
        if joints is not None and len(joints) >= 22:
            # 3D bone length: shoulder -> elbow -> wrist
            arm_len_m = (
                np.linalg.norm(joints[20] - joints[18]) +
                np.linalg.norm(joints[18] - joints[16])
            )
            arm_length_cm = round(arm_len_m * 100.0, 1)
        else:
            # In canonical T-pose, arm spans laterally; fingertips extend ~17cm past wrist joint
            max_x = float(np.max(verts[:, 0]))
            sh_half = (shoulder_cm / 2.0) / 100.0
            arm_length_m = max(0.38, max_x - 0.17 - sh_half)
            arm_length_cm = round(arm_length_m * 100.0, 1)

        # 6. Torso Length (Cervicale neck base at 84.2% to crotch at 49.0%)
        torso_length_cm = round((0.842 - 0.490) * total_height_m * 100.0, 1)

        return {
            "height_cm": float(round(height_cm, 1)),
            "chest_cm": float(round(chest_cm, 1)),
            "waist_cm": float(round(waist_cm, 1)),
            "hip_cm": float(round(hip_cm, 1)),
            "shoulder_cm": float(round(shoulder_cm, 1)),
            "arm_length_cm": float(round(arm_length_cm, 1)),
            "torso_length_cm": float(round(torso_length_cm, 1))
        }
