"""
Phase 5: Fit Advisor Engine
===========================
Đánh giá độ vừa giữa mesh áo 3D và cơ thể người, tính từ:
  - Số đo đo trực tiếp trên mesh áo (không từ bảng size)
  - Heatmap khoảng cách từ đỉnh áo tới thân (theo chuẩn ISO 8559)
  - Ease (độ cử động) theo vùng: ngực, eo, hông, vai, tay
  - Phân loại fit: Tight / Perfect / Loose / Very Loose cho mỗi vùng
  - Gợi ý size lên/xuống có giải thích
"""

import logging
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import trimesh
from scipy.spatial import cKDTree

logger = logging.getLogger("ml_service.fit_advisor")

# ============================================================
# Ease Targets theo ISO 8559-1 (cm) — giá trị độ cử động tối thiểu
# ============================================================
# Giá trị dương: áo rộng hơn thân bấy nhiêu cm
# Giá trị âm: không được, áo không được bó chặt hơn thân
EASE_TARGETS_CM: Dict[str, Dict[str, float]] = {
    "tshirt": {
        "chest": {"min": 4.0, "comfortable": 8.0, "loose": 16.0},
        "waist": {"min": 4.0, "comfortable": 10.0, "loose": 20.0},
        "hip":   {"min": 4.0, "comfortable": 8.0,  "loose": 16.0},
        "shoulder": {"min": 1.0, "comfortable": 3.0, "loose": 8.0},
        "sleeve": {"min": 2.0, "comfortable": 5.0, "loose": 12.0},
    },
    "cardigan": {
        "chest": {"min": 6.0, "comfortable": 12.0, "loose": 22.0},
        "waist": {"min": 6.0, "comfortable": 14.0, "loose": 24.0},
        "hip":   {"min": 6.0, "comfortable": 12.0, "loose": 22.0},
        "shoulder": {"min": 2.0, "comfortable": 4.0, "loose": 10.0},
        "sleeve": {"min": 4.0, "comfortable": 8.0,  "loose": 16.0},
    },
}
# Fallback cho garment type chưa biết
EASE_TARGETS_CM["default"] = EASE_TARGETS_CM["tshirt"]

# ============================================================
# Phân loại fit theo ease
# ============================================================
FIT_LABELS = {
    "very_tight": "Rất chật",
    "tight":      "Chật",
    "perfect":    "Vừa vặn",
    "loose":      "Rộng",
    "very_loose": "Rất rộng",
}


def classify_ease(ease_cm: float, target: Dict[str, float]) -> str:
    """Phân loại fit theo ease thực tế và bảng target."""
    if ease_cm < 0.0:
        return "very_tight"
    if ease_cm < target["min"]:
        return "tight"
    if ease_cm < target["comfortable"]:
        return "perfect"
    if ease_cm < target["loose"]:
        return "loose"
    return "very_loose"


# ============================================================
# GarmentMeasurements: đo trực tiếp trên mesh áo
# ============================================================
class GarmentMeshMeasurements:
    """
    Trích xuất số đo thực tế từ mesh áo 3D đã dựng (không từ bảng size).
    Dùng horizontal slicing giống BodyMeasurements để nhất quán phương pháp.
    """

    @classmethod
    def measure(
        cls,
        garment_mesh: trimesh.Trimesh,
        body_mesh: Optional[trimesh.Trimesh] = None,
    ) -> Dict[str, float]:
        """
        Trả về dict với các key: chest_cm, waist_cm, hip_cm,
        body_length_cm, sleeve_length_cm.
        Tất cả tính từ mesh áo đặt trong không gian SMPL chuẩn.
        """
        verts = garment_mesh.vertices
        y_min = float(np.min(verts[:, 1]))
        y_max = float(np.max(verts[:, 1]))
        total_height_m = max(0.3, y_max - y_min)

        # Nếu có body mesh, dùng đó để định hướng landmark (chính xác hơn)
        if body_mesh is not None:
            bv = body_mesh.vertices
            body_y_min = float(np.min(bv[:, 1]))
            body_y_max = float(np.max(bv[:, 1]))
            body_h = max(0.5, body_y_max - body_y_min)
            y_chest_ref = body_y_min + 0.725 * body_h
            y_waist_ref = body_y_min + 0.605 * body_h
            y_hip_ref   = body_y_min + 0.510 * body_h
            y_shoulder_ref = body_y_min + 0.815 * body_h
        else:
            body_h = total_height_m / 0.55  # ước lượng từ chiều dài thân áo
            y_chest_ref = y_max - 0.095 * body_h
            y_waist_ref = y_max - 0.21 * body_h
            y_hip_ref   = y_min + 0.12 * body_h
            y_shoulder_ref = y_max

        scale_ref = body_h / 1.72 if body_mesh is None else (body_y_max - body_y_min) / 1.72

        def _slice_circ(y_ref: float, x_lim: float) -> float:
            try:
                segs = trimesh.intersections.mesh_plane(
                    garment_mesh,
                    plane_normal=[0.0, 1.0, 0.0],
                    plane_origin=[0.0, y_ref, 0.0]
                )
                if segs is None or len(segs) == 0:
                    return 0.0
                pts = segs.reshape(-1, 3)[:, [0, 2]]
                pts = pts[np.abs(pts[:, 0]) <= x_lim]
                if len(pts) < 3:
                    return 0.0
                from scipy.spatial import ConvexHull
                hull = ConvexHull(pts)
                hpts = pts[hull.vertices]
                diffs = hpts - np.roll(hpts, -1, axis=0)
                return float(np.sum(np.linalg.norm(diffs, axis=1)) * 100.0)
            except Exception:
                return 0.0

        x_lim = 0.32 * scale_ref  # rộng hơn body vì áo có thêm ease

        chest_cm   = _slice_circ(y_chest_ref, x_lim) or 0.0
        waist_cm   = _slice_circ(y_waist_ref, x_lim) or 0.0
        hip_cm     = _slice_circ(y_hip_ref,   x_lim) or 0.0

        # Chiều dài thân áo (từ vai tới hem)
        body_length_cm = float((y_shoulder_ref - y_min) * 100.0)

        # Tay áo: xác định bằng các đỉnh ở xa trục X (|x| > 0.22m)
        arm_verts = verts[np.abs(verts[:, 0]) > 0.22 * scale_ref]
        if len(arm_verts) > 50:
            # Tay trái (x > 0)
            l_arm = arm_verts[arm_verts[:, 0] > 0]
            r_arm = arm_verts[arm_verts[:, 0] < 0]
            def _arm_len(av: np.ndarray) -> float:
                if len(av) < 3:
                    return 0.0
                x_span = float(np.max(av[:, 0]) - np.min(av[:, 0]))
                y_span = float(np.max(av[:, 1]) - np.min(av[:, 1]))
                return float(np.sqrt(x_span**2 + y_span**2) * 100.0)
            sleeve_length_cm = (_arm_len(l_arm) + _arm_len(r_arm)) / 2.0
        else:
            sleeve_length_cm = 0.0

        return {
            "chest_cm":         round(chest_cm, 1),
            "waist_cm":         round(waist_cm, 1),
            "hip_cm":           round(hip_cm, 1),
            "body_length_cm":   round(body_length_cm, 1),
            "sleeve_length_cm": round(sleeve_length_cm, 1),
        }


# ============================================================
# Heatmap: khoảng cách từ đỉnh áo tới thân
# ============================================================
class FitHeatmap:
    """
    Tính khoảng cách (mm) từ mỗi đỉnh của mesh áo tới bề mặt thân người.
    Dùng cKDTree để tìm đỉnh thân gần nhất, rồi chiếu theo pháp tuyến thân.
    Đầu ra: mảng distances_mm có cùng số phần tử với số đỉnh mesh áo.
    """

    @classmethod
    def compute(
        cls,
        garment_mesh: trimesh.Trimesh,
        body_mesh: trimesh.Trimesh,
    ) -> np.ndarray:
        """
        Trả về mảng float32 shape (N_garment_verts,) — khoảng cách mm.
        Giá trị > 0: áo phía ngoài thân (bình thường).
        Giá trị < 0: áo xuyên thân (lỗi collision).
        """
        g_verts = garment_mesh.vertices
        b_verts = body_mesh.vertices
        b_normals = body_mesh.vertex_normals

        tree = cKDTree(b_verts)
        dists, idxs = tree.query(g_verts, k=1)

        nearest_pts  = b_verts[idxs]
        nearest_nrms = b_normals[idxs]

        diff = g_verts - nearest_pts
        signed_dist = np.einsum("ij,ij->i", diff, nearest_nrms)
        return (signed_dist * 1000.0).astype(np.float32)

    @classmethod
    def summarize_by_region(
        cls,
        distances_mm: np.ndarray,
        garment_verts: np.ndarray,
        body_height_m: float = 1.75,
        y_body_min: float = -0.90
    ) -> Dict[str, Dict[str, float]]:
        """
        Tổng hợp thống kê heatmap theo vùng giải phẫu.
        Trả về dict vùng -> {mean_mm, max_mm, min_mm, pct_tight}.
        """
        y = garment_verts[:, 1]
        bh = body_height_m
        y_base = y_body_min

        regions: Dict[str, np.ndarray] = {
            "chest":    (y >= y_base + 0.69*bh) & (y <  y_base + 0.78*bh),
            "waist":    (y >= y_base + 0.59*bh) & (y <  y_base + 0.69*bh),
            "hip":      (y >= y_base + 0.47*bh) & (y <  y_base + 0.59*bh),
            "shoulder": (y >= y_base + 0.78*bh),
            "sleeve":   np.abs(garment_verts[:, 0]) > 0.22 * (bh / 1.72),
        }

        summary: Dict[str, Dict[str, float]] = {}
        for reg, mask in regions.items():
            d = distances_mm[mask]
            if len(d) == 0:
                summary[reg] = {"mean_mm": 0.0, "max_mm": 0.0, "min_mm": 0.0, "pct_tight": 0.0, "n_verts": 0}
                continue
            pct_tight = float(np.mean(d < 5.0) * 100.0)
            summary[reg] = {
                "mean_mm":  round(float(np.mean(d)), 2),
                "max_mm":   round(float(np.max(d)), 2),
                "min_mm":   round(float(np.min(d)), 2),
                "pct_tight": round(pct_tight, 1),
                "n_verts":  int(np.sum(mask)),
            }
        return summary


# ============================================================
# FitAdvisor: tổng hợp đánh giá
# ============================================================
class FitAdvisor:
    """
    Đánh giá độ vừa tổng thể giữa mesh áo và cơ thể người.
    Phương pháp:
      1. Đo số đo thực trên mesh áo.
      2. Tính ease = số đo áo - số đo thân.
      3. Phân loại fit theo vùng.
      4. Gợi ý size (so sánh ease với target).
      5. Tính heatmap khoảng cách.
    """

    # Map từ size lên/xuống
    SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"]

    @classmethod
    def evaluate(
        cls,
        garment_mesh: trimesh.Trimesh,
        body_mesh: trimesh.Trimesh,
        body_measurements: Dict[str, float],
        garment_type: str = "tshirt",
        current_size: str = "M",
        available_sizes: Optional[List[str]] = None,
        size_chart: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Đánh giá độ vừa đầy đủ.

        Args:
            garment_mesh: mesh áo đã dựng
            body_mesh: mesh cơ thể người
            body_measurements: dict từ BodyMeasurements.extract_from_mesh()
            garment_type: "tshirt" | "cardigan" | ...
            current_size: size đang mặc, e.g. "M"
            available_sizes: danh sách size có sẵn của sản phẩm
            size_chart: bảng size thô (từ product spec), dùng khi không có mesh áo đầy đủ

        Returns:
            Dict đầy đủ bao gồm:
              - garment_measurements: số đo đo trực tiếp trên mesh áo
              - ease_by_region: ease_cm + phân loại từng vùng
              - overall_fit: nhãn tổng thể
              - recommended_size: size gợi ý
              - size_action: "keep" | "size_up" | "size_down"
              - confidence: 0.0-1.0
              - heatmap_summary: thống kê khoảng cách mm theo vùng
              - distances_mm: list float (per garment vertex)
              - explanation: string giải thích
        """
        gtype = garment_type.lower().replace("-", "_")
        if gtype not in EASE_TARGETS_CM:
            gtype = "default"
        ease_targets = EASE_TARGETS_CM[gtype]

        # 1. Số đo trên mesh áo
        garm_meas = GarmentMeshMeasurements.measure(garment_mesh, body_mesh)

        # Fallback từ size_chart nếu mesh không slice được đủ
        if size_chart and current_size.upper() in size_chart:
            sc_entry = size_chart[current_size.upper()]
            # Ưu tiên số đo mesh; dùng bảng size khi mesh trả 0
            if garm_meas["chest_cm"] < 5.0 and "chest_cm" in sc_entry:
                garm_meas["chest_cm"] = sc_entry["chest_cm"]
            if garm_meas["body_length_cm"] < 5.0 and "length_cm" in sc_entry:
                garm_meas["body_length_cm"] = sc_entry["length_cm"]

        # 2. Ease theo vùng
        body_chest  = body_measurements.get("chest_cm", 95.0)
        body_waist  = body_measurements.get("waist_cm", 80.0)
        body_hip    = body_measurements.get("hip_cm", 100.0)
        body_shoulder = body_measurements.get("shoulder_cm", 44.0)

        ease_chest    = garm_meas["chest_cm"]   - body_chest   if garm_meas["chest_cm"] > 5 else None
        ease_waist    = garm_meas["waist_cm"]   - body_waist   if garm_meas["waist_cm"] > 5 else None
        ease_hip      = garm_meas["hip_cm"]     - body_hip     if garm_meas["hip_cm"]   > 5 else None

        ease_by_region: Dict[str, Any] = {}

        def _add_region(key: str, ease: Optional[float], target_key: str) -> None:
            if ease is None:
                ease_by_region[key] = {"ease_cm": None, "fit": "unknown", "label": "Không đo được"}
                return
            target = ease_targets.get(target_key, ease_targets.get("chest"))
            fit_class = classify_ease(ease, target)
            ease_by_region[key] = {
                "ease_cm":   round(ease, 1),
                "fit":       fit_class,
                "label":     FIT_LABELS.get(fit_class, fit_class),
                "target_min": target["min"],
                "target_comfortable": target["comfortable"],
            }

        _add_region("chest",    ease_chest,    "chest")
        _add_region("waist",    ease_waist,    "waist")
        _add_region("hip",      ease_hip,      "hip")

        # 3. Overall fit — từ vùng ngực (quan trọng nhất)
        primary_fit = ease_by_region["chest"].get("fit", "perfect")
        overall_fit = primary_fit

        # 4. Gợi ý size
        available = available_sizes or cls.SIZE_ORDER
        sz_upper = current_size.upper()
        sz_idx = cls.SIZE_ORDER.index(sz_upper) if sz_upper in cls.SIZE_ORDER else 2

        size_action = "keep"
        recommended_size = sz_upper

        if primary_fit in ("very_tight", "tight"):
            # Cần size lên
            for bigger in cls.SIZE_ORDER[sz_idx + 1:]:
                if bigger in available:
                    recommended_size = bigger
                    size_action = "size_up"
                    break
        elif primary_fit in ("very_loose",):
            # Có thể size xuống
            for smaller in reversed(cls.SIZE_ORDER[:sz_idx]):
                if smaller in available:
                    recommended_size = smaller
                    size_action = "size_down"
                    break

        # 5. Heatmap
        distances_mm = FitHeatmap.compute(garment_mesh, body_mesh)
        bv = body_mesh.vertices
        body_h = float(np.max(bv[:, 1]) - np.min(bv[:, 1]))
        y_body_min = float(np.min(bv[:, 1]))
        heatmap_summary = FitHeatmap.summarize_by_region(
            distances_mm, garment_mesh.vertices, body_h, y_body_min
        )

        # 6. Độ tin cậy — cao hơn khi số đo mesh đầy đủ
        measured_count = sum(1 for k in ["chest_cm", "waist_cm"] if garm_meas.get(k, 0) > 5)
        confidence = 0.55 + 0.25 * (measured_count / 2.0)
        # Tăng confidence nếu heatmap nhất quán với ease classification
        hm_tight_pct = heatmap_summary.get("chest", {}).get("pct_tight", 50.0)
        if primary_fit in ("very_tight", "tight") and hm_tight_pct > 40.0:
            confidence = min(confidence + 0.12, 0.98)
        elif primary_fit in ("perfect",) and 5.0 < hm_tight_pct < 40.0:
            confidence = min(confidence + 0.08, 0.95)

        # 7. Giải thích
        explanation = cls._build_explanation(
            current_size, recommended_size, size_action, ease_by_region, heatmap_summary
        )

        return {
            "garment_measurements": garm_meas,
            "ease_by_region":       ease_by_region,
            "overall_fit":          overall_fit,
            "overall_fit_label":    FIT_LABELS.get(overall_fit, overall_fit),
            "recommended_size":     recommended_size,
            "size_action":          size_action,
            "confidence":           round(confidence, 3),
            "heatmap_summary":      heatmap_summary,
            "distances_mm":         distances_mm.tolist(),
            "explanation":          explanation,
        }

    @classmethod
    def _build_explanation(
        cls,
        current_size: str,
        recommended_size: str,
        size_action: str,
        ease_by_region: Dict,
        heatmap_summary: Dict,
    ) -> str:
        lines = []
        chest_ease = ease_by_region.get("chest", {}).get("ease_cm")
        chest_label = ease_by_region.get("chest", {}).get("label", "")
        chest_tight_pct = heatmap_summary.get("chest", {}).get("pct_tight", 0.0)

        if chest_ease is not None:
            lines.append(
                f"Vòng ngực: độ cử động thực tế = {chest_ease:+.1f} cm ({chest_label}), "
                f"{chest_tight_pct:.0f}% vùng ngực có khoảng cách < 5 mm so với thân."
            )
        else:
            lines.append("Vòng ngực: không đo được từ mesh áo.")

        waist_ease = ease_by_region.get("waist", {}).get("ease_cm")
        waist_label = ease_by_region.get("waist", {}).get("label", "")
        if waist_ease is not None:
            lines.append(f"Vòng eo: độ cử động thực tế = {waist_ease:+.1f} cm ({waist_label}).")

        if size_action == "keep":
            lines.append(f"→ Size {current_size} vừa vặn. Không cần đổi size.")
        elif size_action == "size_up":
            lines.append(
                f"→ Cảnh báo: Size {current_size} bị chật. "
                f"Khuyến nghị đổi sang Size {recommended_size} để thoải mái hơn."
            )
        elif size_action == "size_down":
            lines.append(
                f"→ Size {current_size} có vẻ rộng. "
                f"Bạn có thể thử Size {recommended_size} nếu thích phom ôm sát hơn."
            )

        return " ".join(lines)


# ============================================================
# Convenience wrapper cho router
# ============================================================
def evaluate_fit_from_glb_paths(
    garment_glb_path: str,
    body_betas: List[float],
    body_gender: str = "neutral",
    garment_type: str = "tshirt",
    current_size: str = "M",
    size_chart: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Convenience function: load garment GLB từ đường dẫn file,
    build body mesh từ betas, rồi gọi FitAdvisor.evaluate().
    """
    from core.body_model import BodyModel
    from core.measurements import BodyMeasurements

    # Load garment mesh
    if not __import__("os").path.exists(garment_glb_path):
        raise FileNotFoundError(f"Garment GLB not found: {garment_glb_path}")

    raw = trimesh.load(garment_glb_path, force="mesh")
    if isinstance(raw, trimesh.Scene):
        geoms = list(raw.geometry.values())
        garment_mesh = trimesh.util.concatenate(geoms) if geoms else trimesh.Trimesh()
    else:
        garment_mesh = raw

    if len(garment_mesh.vertices) < 100:
        raise ValueError("Garment mesh is empty or too small.")

    # Build body mesh
    model = BodyModel(gender=body_gender)
    body_mesh = model.get_trimesh(betas=body_betas, pose="a_pose")
    body_measurements = BodyMeasurements.extract_from_mesh(body_mesh)

    return FitAdvisor.evaluate(
        garment_mesh=garment_mesh,
        body_mesh=body_mesh,
        body_measurements=body_measurements,
        garment_type=garment_type,
        current_size=current_size,
        size_chart=size_chart,
    )

