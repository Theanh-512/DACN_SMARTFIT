from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class BodyMeasurements(BaseModel):
    height_cm: float = Field(..., ge=120, le=230, description="Chiều cao (cm)")
    weight_kg: Optional[float] = Field(None, ge=30, le=200, description="Cân nặng (kg)")
    chest_cm: Optional[float] = Field(None, ge=60, le=160, description="Vòng ngực (cm)")
    waist_cm: Optional[float] = Field(None, ge=50, le=150, description="Vòng eo (cm)")
    hip_cm: Optional[float] = Field(None, ge=60, le=160, description="Vòng mông (cm)")
    shoulder_cm: Optional[float] = Field(None, ge=30, le=65, description="Chiều rộng vai (cm)")

class SizeRecommendationRequest(BaseModel):
    category_id: str = Field(..., description="Mã danh mục (vd: cat-tshirts, cat-jackets, cat-pants)")
    fit_preference: str = Field("regular", description="Sở thích phom dáng: slim (ôm), regular (vừa vặn), relaxed (rộng rãi)")
    measurements: BodyMeasurements

class MeasurementDelta(BaseModel):
    measurement_name: str
    body_val: float
    garment_val: float
    actual_ease: float
    target_ease: float
    status: str  # "perfect", "slightly_loose", "tight", "loose"

class SizeScore(BaseModel):
    size: str
    score: float
    is_wearable: bool
    chest_ease: Optional[float] = None
    waist_ease: Optional[float] = None
    hip_ease: Optional[float] = None

class SizeRecommendationResponse(BaseModel):
    recommended_size: str
    alternative_size: Optional[str] = None
    confidence_score: float
    fit_preference: str
    explanation: str
    measurement_breakdown: List[MeasurementDelta]
    all_scores: List[SizeScore]
    warnings: List[str]


# BẢNG THÔNG SỐ KÍCH THƯỚC CHUẨN LIFEWEAR THEO TỪNG DANH MỤC SẢN PHẨM (GARMENT FINISHED MEASUREMENTS)
STANDARD_SIZE_CHARTS: Dict[str, Dict[str, Dict[str, float]]] = {
    # 1. Áo thun, Polo, Sơ mi (Tops)
    "cat-tshirts": {
        "XS": {"chest": 88.0, "shoulder": 41.5, "length": 64.0},
        "S":  {"chest": 94.0, "shoulder": 43.0, "length": 66.0},
        "M":  {"chest": 100.0, "shoulder": 44.5, "length": 69.0},
        "L":  {"chest": 106.0, "shoulder": 46.5, "length": 72.0},
        "XL": {"chest": 114.0, "shoulder": 48.5, "length": 75.0},
        "XXL":{"chest": 122.0, "shoulder": 51.0, "length": 77.0}
    },
    "cat-shirts": {
        "S":  {"chest": 96.0, "shoulder": 43.5, "length": 70.0},
        "M":  {"chest": 102.0, "shoulder": 45.0, "length": 72.0},
        "L":  {"chest": 108.0, "shoulder": 47.0, "length": 74.0},
        "XL": {"chest": 116.0, "shoulder": 49.0, "length": 76.0},
        "XXL":{"chest": 124.0, "shoulder": 51.5, "length": 78.0}
    },
    # 2. Áo khoác, Áo nỉ, Fleece, Cardigan (Outerwear)
    "cat-jackets": {
        "S":  {"chest": 102.0, "shoulder": 45.0, "length": 67.0},
        "M":  {"chest": 108.0, "shoulder": 47.0, "length": 70.0},
        "L":  {"chest": 114.0, "shoulder": 49.0, "length": 73.0},
        "XL": {"chest": 122.0, "shoulder": 51.5, "length": 75.0},
        "XXL":{"chest": 130.0, "shoulder": 54.0, "length": 77.0}
    },
    "cat-fleece": {
        "S":  {"chest": 100.0, "shoulder": 44.0, "length": 66.0},
        "M":  {"chest": 106.0, "shoulder": 46.0, "length": 69.0},
        "L":  {"chest": 112.0, "shoulder": 48.0, "length": 72.0},
        "XL": {"chest": 120.0, "shoulder": 50.5, "length": 74.0},
        "XXL":{"chest": 128.0, "shoulder": 53.0, "length": 76.0}
    },
    # 3. Quần dài, Quần Jeans, Quần âu (Bottoms)
    "cat-pants": {
        "S":  {"waist": 74.0, "hip": 98.0, "length": 98.0},
        "M":  {"waist": 80.0, "hip": 104.0, "length": 100.0},
        "L":  {"waist": 86.0, "hip": 110.0, "length": 102.0},
        "XL": {"waist": 93.0, "hip": 117.0, "length": 104.0},
        "XXL":{"waist": 101.0, "hip": 125.0, "length": 105.0}
    },
    "cat-jeans": {
        "S":  {"waist": 73.0, "hip": 96.0, "length": 99.0},
        "M":  {"waist": 79.0, "hip": 102.0, "length": 101.0},
        "L":  {"waist": 85.0, "hip": 108.0, "length": 103.0},
        "XL": {"waist": 92.0, "hip": 115.0, "length": 105.0},
        "XXL":{"waist": 100.0, "hip": 123.0, "length": 106.0}
    },
    # 4. Đầm & Váy (Dresses)
    "cat-dresses": {
        "S":  {"chest": 86.0, "waist": 68.0, "hip": 92.0, "length": 106.0},
        "M":  {"chest": 92.0, "waist": 73.0, "hip": 97.0, "length": 109.0},
        "L":  {"chest": 98.0, "waist": 79.0, "hip": 103.0, "length": 112.0},
        "XL": {"chest": 105.0, "waist": 86.0, "hip": 110.0, "length": 114.0}
    }
}

# ĐỘ CỬ ĐỘNG MỤC TIÊU THEO DANH MỤC VÀ SỞ THÍCH PHOM DÁNG (EASE ALLOWANCE TRÊN SỐ ĐO VÒNG CHÍNH)
TARGET_EASE_MAP = {
    # Tops / Shirts: số đo ngực
    "cat-tshirts": {"slim": 4.0, "regular": 8.0, "relaxed": 14.0},
    "cat-shirts":  {"slim": 5.0, "regular": 9.0, "relaxed": 15.0},
    # Outerwear: cần độ cử động lớn hơn để mặc lớp lót bên trong
    "cat-jackets": {"slim": 8.0, "regular": 14.0, "relaxed": 20.0},
    "cat-fleece":  {"slim": 7.0, "regular": 12.0, "relaxed": 18.0},
    # Bottoms: số đo eo (độ cử động nhỏ hơn để không bị tụt)
    "cat-pants":   {"slim": 1.5, "regular": 4.0, "relaxed": 7.0},
    "cat-jeans":   {"slim": 1.0, "regular": 3.5, "relaxed": 6.5},
    # Dresses: ngực và eo
    "cat-dresses": {"slim": 3.0, "regular": 6.0, "relaxed": 10.0}
}


class ExplainableSizeRecommender:
    """
    Thuật toán đề xuất kích cỡ giải thích được (Explainable Fit Scoring).
    Sử dụng hàm phạt bất đối xứng giữa số đo cơ thể thực và thông số may mặc thành phẩm.
    """

    @classmethod
    def estimate_missing_measurements(cls, height: float, weight: Optional[float]) -> Dict[str, float]:
        """
        Ước lượng hồi quy các số đo vòng khi người dùng chỉ cung cấp chiều cao và cân nặng.
        Công thức nhân trắc học tiêu chuẩn người Việt/Đông Á.
        """
        w = weight if weight else ((height - 100) * 0.9)
        # Ước lượng vòng ngực: BMI kết hợp chiều cao
        est_chest = 0.52 * height + 0.35 * w
        # Ước lượng vòng eo:
        est_waist = 0.42 * height + 0.38 * w
        # Ước lượng vòng mông:
        est_hip = 0.54 * height + 0.36 * w
        # Ước lượng rộng vai:
        est_shoulder = 0.25 * height + 0.05 * w

        return {
            "chest": round(est_chest, 1),
            "waist": round(est_waist, 1),
            "hip": round(est_hip, 1),
            "shoulder": round(est_shoulder, 1)
        }

    @classmethod
    def compute_asymmetric_penalty(cls, actual_ease: float, target_ease: float) -> float:
        """
        Hàm phạt bất đối xứng:
        - Nếu actual_ease < 0: Quần áo nhỏ hơn số đo cơ thể (Không thể mặc được). Phạt rất nặng.
        - Nếu 0 <= actual_ease < target_ease: Hơi ôm hơn mong muốn. Phạt vừa phải.
        - Nếu actual_ease >= target_ease: Hơi rộng hơn mong muốn. Phạt nhẹ theo hàm tuyến tính.
        """
        if actual_ease < -0.5:
            # Không thể nẹp khóa hoặc khuy áo bị căng rách
            return 60.0 + 10.0 * (abs(actual_ease) ** 1.3)
        elif actual_ease < target_ease:
            delta = target_ease - actual_ease
            return 3.0 * delta
        else:
            delta = actual_ease - target_ease
            return 2.0 * delta

    @classmethod
    def recommend(cls, req: SizeRecommendationRequest) -> SizeRecommendationResponse:
        cat_id = req.category_id if req.category_id in STANDARD_SIZE_CHARTS else "cat-tshirts"
        size_chart = STANDARD_SIZE_CHARTS[cat_id]
        ease_map = TARGET_EASE_MAP.get(cat_id, {"slim": 4.0, "regular": 8.0, "relaxed": 14.0})
        pref = req.fit_preference.lower()
        if pref not in ease_map:
            pref = "regular"
        target_primary_ease = ease_map[pref]

        m = req.measurements
        warnings = []

        # Điền số đo ước lượng nếu người dùng chưa nhập
        estimated = cls.estimate_missing_measurements(m.height_cm, m.weight_kg)
        chest = m.chest_cm if m.chest_cm else estimated["chest"]
        waist = m.waist_cm if m.waist_cm else estimated["waist"]
        hip = m.hip_cm if m.hip_cm else estimated["hip"]

        if not m.chest_cm and cat_id in ["cat-tshirts", "cat-shirts", "cat-jackets", "cat-fleece", "cat-dresses"]:
            warnings.append(f"Chưa có số đo vòng ngực thực tế. Hệ thống tạm tính {chest:.0f}cm dựa trên chiều cao {m.height_cm}cm và cân nặng {m.weight_kg}kg.")
        if not m.waist_cm and cat_id in ["cat-pants", "cat-jeans"]:
            warnings.append(f"Chưa có số đo vòng eo thực tế. Hệ thống tạm tính {waist:.0f}cm dựa trên chiều cao và cân nặng.")

        # Xác định chỉ số chính của danh mục
        is_bottom = cat_id in ["cat-pants", "cat-jeans"]
        primary_body_val = waist if is_bottom else chest
        primary_key = "waist" if is_bottom else "chest"
        primary_label = "Vòng eo" if is_bottom else "Vòng ngực"

        scores: List[SizeScore] = []

        for size_label, dims in size_chart.items():
            garment_primary = dims.get(primary_key, 0.0)
            actual_ease = garment_primary - primary_body_val
            is_wearable = actual_ease >= 0.0

            penalty = cls.compute_asymmetric_penalty(actual_ease, target_primary_ease)

            # Phạt thêm nếu chiều dài áo/quần quá lệch so với chiều cao
            if "length" in dims and m.height_cm:
                ideal_top_len = m.height_cm * 0.41
                ideal_bottom_len = m.height_cm * 0.58
                ideal_len = ideal_bottom_len if is_bottom else ideal_top_len
                len_delta = abs(dims["length"] - ideal_len)
                if len_delta > 5.0:
                    penalty += (len_delta - 5.0) * 0.8

            raw_score = max(5.0, min(100.0, 100.0 - penalty))
            scores.append(SizeScore(
                size=size_label,
                score=round(raw_score, 1),
                is_wearable=is_wearable,
                chest_ease=round(dims["chest"] - chest, 1) if "chest" in dims else None,
                waist_ease=round(dims["waist"] - waist, 1) if "waist" in dims else None,
                hip_ease=round(dims["hip"] - hip, 1) if "hip" in dims else None
            ))

        # Sắp xếp điểm số giảm dần
        scores.sort(key=lambda s: s.score, reverse=True)
        top1 = scores[0]
        top2 = scores[1] if len(scores) > 1 and scores[1].is_wearable and scores[1].score >= 60.0 else None

        # Xây dựng bảng chi tiết độ chênh lệch (Measurement Breakdown) cho Top-1
        best_dims = size_chart[top1.size]
        breakdown: List[MeasurementDelta] = []

        if "chest" in best_dims:
            c_ease = best_dims["chest"] - chest
            status = "perfect" if abs(c_ease - target_primary_ease) <= 2.0 else ("tight" if c_ease < 0 else "slightly_loose")
            breakdown.append(MeasurementDelta(
                measurement_name="Vòng ngực",
                body_val=chest,
                garment_val=best_dims["chest"],
                actual_ease=round(c_ease, 1),
                target_ease=target_primary_ease if not is_bottom else 6.0,
                status=status
            ))

        if "waist" in best_dims:
            w_ease = best_dims["waist"] - waist
            target_w_ease = target_primary_ease if is_bottom else 6.0
            status = "perfect" if abs(w_ease - target_w_ease) <= 2.0 else ("tight" if w_ease < 0 else "slightly_loose")
            breakdown.append(MeasurementDelta(
                measurement_name="Vòng eo",
                body_val=waist,
                garment_val=best_dims["waist"],
                actual_ease=round(w_ease, 1),
                target_ease=target_w_ease,
                status=status
            ))

        if "hip" in best_dims:
            h_ease = best_dims["hip"] - hip
            breakdown.append(MeasurementDelta(
                measurement_name="Vòng mông",
                body_val=hip,
                garment_val=best_dims["hip"],
                actual_ease=round(h_ease, 1),
                target_ease=8.0,
                status="perfect" if h_ease >= 3.0 else "tight"
            ))

        # Soạn thảo lý do giải thích minh bạch
        actual_top1_ease = best_dims[primary_key] - primary_body_val
        pref_vn = "ôm vừa (Slim)" if pref == "slim" else ("tiêu chuẩn (Regular)" if pref == "regular" else "rộng rãi (Relaxed)")
        
        explanation = (
            f"Kích cỡ tối ưu nhất là {top1.size} (Độ tương thích {top1.score}%). "
            f"{primary_label} của bạn là {primary_body_val:.0f}cm. "
            f"Sản phẩm size {top1.size} có {primary_label.lower()} may đo {best_dims[primary_key]:.0f}cm, "
            f"tạo độ cử động dư {actual_top1_ease:.1f}cm — hoàn toàn chuẩn xác theo phong cách mặc {pref_vn} "
            f"(chuẩn cử động khuyến nghị: +{target_primary_ease:.0f}cm)."
        )

        if top2:
            alt_dims = size_chart[top2.size]
            alt_ease = alt_dims[primary_key] - primary_body_val
            explanation += (
                f" Nếu bạn muốn mặc {'rộng rãi hơn nữa' if alt_ease > actual_top1_ease else 'gọn dáng hơn'}, "
                f"size {top2.size} ({top2.score}%) là lựa chọn thay thế phù hợp."
            )

        return SizeRecommendationResponse(
            recommended_size=top1.size,
            alternative_size=top2.size if top2 else None,
            confidence_score=top1.score,
            fit_preference=pref,
            explanation=explanation,
            measurement_breakdown=breakdown,
            all_scores=scores,
            warnings=warnings
        )
