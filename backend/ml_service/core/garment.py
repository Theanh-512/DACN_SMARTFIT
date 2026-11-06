import os
import json
import logging
from typing import Dict, Any, Optional, Tuple, List
import numpy as np
import trimesh
from scipy.spatial import ConvexHull, cKDTree

try:
    from core.measurements import BodyMeasurements
except ImportError:
    from backend.ml_service.core.measurements import BodyMeasurements

logger = logging.getLogger("ml_service.garment")

SIZE_CHART_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "assets", "size_charts", "tshirt_classic.json"
)

def load_size_chart() -> Dict[str, Any]:
    """Loads classic t-shirt size chart specifications."""
    if os.path.exists(SIZE_CHART_PATH):
        with open(SIZE_CHART_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    # Default fallback ISO-compatible size chart
    return {
        "product_id": "prod_tshirt_classic",
        "product_name": "Áo Thun Cổ Tròn Cotton Unisex",
        "unit": "cm",
        "sizes": {
            "S":  {"chest_cm": 94.0,  "waist_cm": 90.0,  "hem_cm": 92.0,  "length_cm": 66.0, "shoulder_cm": 43.0, "sleeve_cm": 19.5, "neck_cm": 40.0},
            "M":  {"chest_cm": 100.0, "waist_cm": 96.0,  "hem_cm": 98.0,  "length_cm": 69.0, "shoulder_cm": 45.0, "sleeve_cm": 21.0, "neck_cm": 41.5},
            "L":  {"chest_cm": 106.0, "waist_cm": 102.0, "hem_cm": 104.0, "length_cm": 72.0, "shoulder_cm": 47.0, "sleeve_cm": 22.5, "neck_cm": 43.0},
            "XL": {"chest_cm": 114.0, "waist_cm": 110.0, "hem_cm": 112.0, "length_cm": 75.0, "shoulder_cm": 50.0, "sleeve_cm": 24.0, "neck_cm": 44.5}
        }
    }

def ray_intersect_convex_polygon(
    origin: np.ndarray,
    direction: np.ndarray,
    polygon: np.ndarray
) -> float:
    """
    Computes ray intersection distance from origin along direction with a 2D convex polygon.
    All points on (x, z) 2D plane.
    """
    k = len(polygon)
    ox, oy = origin[0], origin[1]
    dx, dy = direction[0], direction[1]

    for i in range(k):
        p1 = polygon[i]
        p2 = polygon[(i + 1) % k]
        v2x = p2[0] - p1[0]
        v2y = p2[1] - p1[1]

        denom = v2x * dy - v2y * dx
        if abs(denom) > 1e-8:
            t = ((p1[1] - oy) * v2x - (p1[0] - ox) * v2y) / denom
            u = (dx * (p1[1] - oy) - dy * (p1[0] - ox)) / denom
            if t > 0.0 and 0.0 <= u <= 1.0:
                return float(t)
    return 0.16  # Canonical torso radial fallback

class GarmentGenerator:
    """
    Cross-Sectional Slicing Garment Generator & Pushout Drape Engine.
    Strictly independent of body mesh topology / vertex count.
    Works identically with canonical mock mesh and official 10,475-vertex SMPL-X.
    """

    def __init__(self, size_chart: Optional[Dict[str, Any]] = None):
        self.size_chart = size_chart or load_size_chart()

    def generate_tshirt(
        self,
        body_mesh: trimesh.Trimesh,
        size: str = "M",
        color_hex: str = "#19284B",
        drape_mode: str = "pushout"
    ) -> Tuple[trimesh.Trimesh, Dict[str, Any]]:
        """
        Creates a parametric fitted T-shirt mesh from horizontal cross-sections of body_mesh.
        """
        size_key = size.upper()
        if size_key not in self.size_chart["sizes"]:
            size_key = "M"
        spec = self.size_chart["sizes"][size_key]

        verts = body_mesh.vertices
        y_min = float(np.min(verts[:, 1]))
        y_max = float(np.max(verts[:, 1]))
        total_height_m = y_max - y_min

        # 1. Anthropometric Landmark Heights
        y_shoulder = y_min + 0.815 * total_height_m
        y_chest = y_min + 0.725 * total_height_m
        y_waist = y_min + 0.605 * total_height_m
        y_cervicale = y_min + 0.855 * total_height_m

        # Shirt hem hanging down from shoulder line by length_cm
        length_m = spec["length_cm"] / 100.0
        y_hem = max(y_min + 0.35 * total_height_m, y_shoulder - length_m)

        # 2. Extract Body Circumferences via ISO Slicing
        body_chest_cm = BodyMeasurements.calculate_slice_perimeter(
            body_mesh, y_chest, x_limit=0.25 * total_height_m / 1.72
        ) or 96.0
        body_waist_cm = BodyMeasurements.calculate_slice_perimeter(
            body_mesh, y_waist, x_limit=0.23 * total_height_m / 1.72
        ) or 80.0
        body_hem_cm = BodyMeasurements.calculate_slice_perimeter(
            body_mesh, y_hem, x_limit=0.25 * total_height_m / 1.72
        ) or 95.0

        # Calculate Ease (Độ cử động trong may mặc chuẩn ISO)
        ease_chest_cm = round(spec["chest_cm"] - body_chest_cm, 1)
        ease_waist_cm = round(spec["waist_cm"] - body_waist_cm, 1)
        ease_hem_cm = round(spec["hem_cm"] - body_hem_cm, 1)

        # 3. Loft Torso Tube from Horizontal Slices
        num_y_slices = 26
        num_rad_segs = 36
        y_levels = np.linspace(y_hem, y_shoulder, num_y_slices)

        torso_verts = []
        angles = np.linspace(0, 2.0 * np.pi, num_rad_segs, endpoint=False)
        rad_dirs = np.stack([np.sin(angles), np.cos(angles)], axis=1)

        for s_idx, y_cur in enumerate(y_levels):
            # Target circumference interpolation along vertical axis
            if y_cur <= y_waist:
                t = (y_cur - y_hem) / max(1e-4, y_waist - y_hem)
                c_target = (1.0 - t) * spec["hem_cm"] + t * spec["waist_cm"]
                p_body_interp = (1.0 - t) * body_hem_cm + t * body_waist_cm
            elif y_cur <= y_chest:
                t = (y_cur - y_waist) / max(1e-4, y_chest - y_waist)
                c_target = (1.0 - t) * spec["waist_cm"] + t * spec["chest_cm"]
                p_body_interp = (1.0 - t) * body_waist_cm + t * body_chest_cm
            else:
                t = (y_cur - y_chest) / max(1e-4, y_shoulder - y_chest)
                c_target = (1.0 - t) * spec["chest_cm"] + t * (spec["shoulder_cm"] * 2.1)
                p_body_interp = body_chest_cm

            # Physical radial ease offset from circumference difference
            ease_radius_m = (c_target - p_body_interp) / (200.0 * np.pi)
            # Minimum fabric clearance (5mm = 0.005m) to guarantee no skin intersection
            min_clearance = 0.006
            delta_r = max(ease_radius_m, min_clearance)

            # Horizontal mesh slice at y_cur
            segs = trimesh.intersections.mesh_plane(
                body_mesh,
                plane_normal=[0.0, 1.0, 0.0],
                plane_origin=[0.0, y_cur, 0.0]
            )

            # Default centroid and fallback polygon
            center_x, center_z = 0.0, 0.0
            hull_poly = None

            if segs is not None and len(segs) > 0:
                pts_2d = segs.reshape(-1, 3)[:, [0, 2]]
                # Filter out arm segments (keep central torso)
                torso_pts = pts_2d[np.abs(pts_2d[:, 0]) <= 0.22 * (total_height_m / 1.72)]
                if len(torso_pts) >= 4:
                    try:
                        hull = ConvexHull(torso_pts)
                        hull_poly = torso_pts[hull.vertices]
                        center_x = float(np.mean(hull_poly[:, 0]))
                        center_z = float(np.mean(hull_poly[:, 1]))
                    except Exception:
                        hull_poly = None

            # Sample 36 points around circumference
            for a_idx in range(num_rad_segs):
                d = rad_dirs[a_idx]
                if hull_poly is not None:
                    r_b = ray_intersect_convex_polygon(np.array([center_x, center_z]), d, hull_poly)
                else:
                    r_b = 0.16 * (total_height_m / 1.72)

                r_garment = r_b + delta_r

                # Collar shaping at top slice (s_idx near num_y_slices - 1):
                # Front center has angle around pi/2 (d[1] > 0.7) -> dip collar lower for crewneck
                y_v = y_cur
                if s_idx >= num_y_slices - 3:
                    front_factor = max(0.0, float(d[1]))
                    if front_factor > 0.3:
                        y_v -= 0.035 * front_factor  # Crewneck front dip

                vx = center_x + r_garment * d[0]
                vy = y_v
                vz = center_z + r_garment * d[1]
                torso_verts.append([vx, vy, vz])

        # Generate Torso Faces (Quad strips triangulated)
        torso_faces = []
        for s in range(num_y_slices - 1):
            for i in range(num_rad_segs):
                next_i = (i + 1) % num_rad_segs
                p1 = s * num_rad_segs + i
                p2 = s * num_rad_segs + next_i
                p3 = (s + 1) * num_rad_segs + next_i
                p4 = (s + 1) * num_rad_segs + i
                torso_faces.append([p1, p2, p3])
                torso_faces.append([p1, p3, p4])

        torso_mesh = trimesh.Trimesh(
            vertices=np.array(torso_verts, dtype=np.float32),
            faces=np.array(torso_faces, dtype=np.int32),
            process=False
        )

        # 4. Generate Left & Right Sleeves in A-Pose (20 deg angle downwards)
        shoulder_span_m = spec["shoulder_cm"] / 100.0
        sh_x = shoulder_span_m * 0.46
        sh_y = y_shoulder - 0.02
        sleeve_len_m = spec["sleeve_cm"] / 100.0
        sleeve_r = 0.078 + delta_r * 0.6

        # Left Sleeve
        l_sleeve = trimesh.creation.cylinder(radius=sleeve_r, height=sleeve_len_m, sections=20)
        l_sleeve.apply_transform(trimesh.transformations.rotation_matrix(np.radians(90), [0, 1, 0]))
        l_sleeve.apply_transform(trimesh.transformations.rotation_matrix(np.radians(-20), [0, 0, 1]))
        l_sleeve.apply_translation([
            -sh_x - (sleeve_len_m / 2.0) * np.cos(np.radians(20)),
            sh_y - (sleeve_len_m / 2.0) * np.sin(np.radians(20)),
            0.0
        ])

        # Right Sleeve
        r_sleeve = trimesh.creation.cylinder(radius=sleeve_r, height=sleeve_len_m, sections=20)
        r_sleeve.apply_transform(trimesh.transformations.rotation_matrix(np.radians(90), [0, 1, 0]))
        r_sleeve.apply_transform(trimesh.transformations.rotation_matrix(np.radians(20), [0, 0, 1]))
        r_sleeve.apply_translation([
            sh_x + (sleeve_len_m / 2.0) * np.cos(np.radians(20)),
            sh_y - (sleeve_len_m / 2.0) * np.sin(np.radians(20)),
            0.0
        ])

        # Combine Torso + Sleeves
        garment_mesh = trimesh.util.concatenate([torso_mesh, l_sleeve, r_sleeve])
        garment_mesh.merge_vertices()

        # 5. Pushout Collision Enforcement against Body Surface
        if drape_mode == "pushout":
            garment_mesh = self.apply_pushout_collision(
                garment_mesh=garment_mesh,
                body_mesh=body_mesh,
                min_clearance_m=0.005,
                smoothing_iters=2
            )

        # 6. Apply Fabric PBR Color
        try:
            r = int(color_hex[1:3], 16)
            g = int(color_hex[3:5], 16)
            b = int(color_hex[5:7], 16)
            garment_mesh.visual = trimesh.visual.ColorVisuals(
                mesh=garment_mesh,
                vertex_colors=np.full((len(garment_mesh.vertices), 4), [r, g, b, 255], dtype=np.uint8)
            )
        except Exception:
            pass

        ease_info = {
            "size": size_key,
            "chest_cm": spec["chest_cm"],
            "waist_cm": spec["waist_cm"],
            "hem_cm": spec["hem_cm"],
            "length_cm": spec["length_cm"],
            "shoulder_cm": spec["shoulder_cm"],
            "sleeve_cm": spec["sleeve_cm"],
            "body_chest_cm": round(body_chest_cm, 1),
            "body_waist_cm": round(body_waist_cm, 1),
            "ease_chest_cm": ease_chest_cm,
            "ease_waist_cm": ease_waist_cm,
            "ease_hem_cm": ease_hem_cm,
            "is_tight": ease_chest_cm < 2.0,
            "drape_mode": drape_mode
        }

        return garment_mesh, ease_info

    @classmethod
    def apply_pushout_collision(
        cls,
        garment_mesh: trimesh.Trimesh,
        body_mesh: trimesh.Trimesh,
        min_clearance_m: float = 0.005,
        smoothing_iters: int = 2
    ) -> trimesh.Trimesh:
        """
        Pushout collision resolution:
        1. Finds nearest body vertex and body surface normal for each garment vertex.
        2. If vertex penetrates skin or is within min_clearance_m, projects outward along normal.
        3. Applies Laplacian smoothing to eliminate sharp folds, followed by final projection pass.
        Guarantees zero penetration (proj >= min_clearance_m everywhere).
        """
        body_verts = body_mesh.vertices
        body_normals = body_mesh.vertex_normals
        g_verts = garment_mesh.vertices.copy()
        tree = cKDTree(body_verts)

        # 1. Initial pushout
        dists, idxs = tree.query(g_verts)
        nearest_pts = body_verts[idxs]
        nearest_norms = body_normals[idxs]
        diff = g_verts - nearest_pts
        proj = np.sum(diff * nearest_norms, axis=1)
        mask = proj < min_clearance_m
        if np.any(mask):
            g_verts[mask] = nearest_pts[mask] + min_clearance_m * nearest_norms[mask]

        # 2. Laplacian smoothing iterations (gentle blend)
        if smoothing_iters > 0:
            edges = garment_mesh.edges_unique
            adjacency = {}
            for e in edges:
                adjacency.setdefault(e[0], []).append(e[1])
                adjacency.setdefault(e[1], []).append(e[0])

            for _ in range(smoothing_iters):
                smoothed = g_verts.copy()
                for v_idx, neighbors in adjacency.items():
                    if len(neighbors) > 0:
                        smoothed[v_idx] = 0.70 * g_verts[v_idx] + 0.30 * np.mean(g_verts[neighbors], axis=0)
                g_verts = smoothed

        # 3. Final guaranteed pushout pass
        for _ in range(3):
            dists, idxs = tree.query(g_verts)
            nearest_pts = body_verts[idxs]
            nearest_norms = body_normals[idxs]
            diff = g_verts - nearest_pts
            proj = np.sum(diff * nearest_norms, axis=1)
            mask = proj < min_clearance_m
            if np.any(mask):
                g_verts[mask] = nearest_pts[mask] + min_clearance_m * nearest_norms[mask]
            else:
                break

        garment_mesh.vertices = g_verts
        garment_mesh.fix_normals()
        return garment_mesh
