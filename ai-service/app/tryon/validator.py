import io
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple, Optional
from pydantic import BaseModel

class QualityDiagnostics(BaseModel):
    width: int
    height: int
    aspect_ratio: float
    file_size_kb: float
    blur_score: float         # Phương sai Laplacian (Laplacian variance)
    is_blurry: bool
    mean_luminance: float     # Độ sáng trung bình [0, 255]
    is_underexposed: bool
    is_overexposed: bool
    skin_pixel_percent: float # Ước lượng tỷ lệ diện tích da người
    has_person_silhouette: bool

class ValidationResult(BaseModel):
    is_valid: bool
    error_code: Optional[str] = None
    message: str
    diagnostics: Optional[QualityDiagnostics] = None

class TryOnInputValidator:
    """
    Bộ kiểm định chất lượng ảnh đầu vào phục vụ Virtual Try-On (Quality Control & Validation).
    Ngăn chặn việc đẩy ảnh kém chất lượng vào mô hình sinh ảnh Diffusion tốn kém tài nguyên:
    - Kiểm tra định dạng và dung lượng file
    - Kiểm tra độ phân giải và tỷ lệ khung hình chuẩn chân dung thời trang (3:4 hoặc 1:1)
    - Phát hiện ảnh rung mờ (Blur detection qua phương sai toán tử Laplacian)
    - Kiểm tra dải phơi sáng (quá tối / cháy sáng)
    - Nhận diện bóng dáng và màu da người sơ bộ (Heuristic Person Silhouette Check)
    """

    MIN_RESOLUTION: int = 400
    MAX_RESOLUTION: int = 4096
    MIN_LAPLACIAN_VAR: float = 60.0    # Ngưỡng phát hiện mờ
    MIN_LUMINANCE: float = 35.0        # Ngưỡng thiếu sáng
    MAX_LUMINANCE: float = 230.0       # Ngưỡng cháy sáng
    MIN_SKIN_PERCENT: float = 1.0       # Tối thiểu 1.0% diện tích ảnh có màu da người

    @classmethod
    def validate_person_image(cls, image_bytes: bytes) -> ValidationResult:
        file_size_kb = len(image_bytes) / 1024.0

        if file_size_kb > 15360: # 15MB
            return ValidationResult(
                is_valid=False,
                error_code="FILE_TOO_LARGE",
                message=f"Dung lượng ảnh ({file_size_kb:.1f}KB) vượt quá giới hạn 15MB cho phép."
            )

        try:
            pil_img = Image.open(io.BytesIO(image_bytes))
            w, h = pil_img.size
            aspect_ratio = round(w / float(h), 3)

            # Chuyển đổi sang mảng Numpy OpenCV BGR
            cv_img = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)
            if cv_img is None:
                return ValidationResult(
                    is_valid=False,
                    error_code="CORRUPTED_IMAGE",
                    message="Tệp ảnh bị lỗi cấu trúc hoặc không thể giải mã định dạng."
                )

            # 1. Kiểm tra độ phân giải
            if w < cls.MIN_RESOLUTION or h < cls.MIN_RESOLUTION:
                return ValidationResult(
                    is_valid=False,
                    error_code="RESOLUTION_TOO_LOW",
                    message=f"Độ phân giải ảnh ({w}x{h}) quá nhỏ. Tối thiểu cần {cls.MIN_RESOLUTION}x{cls.MIN_RESOLUTION}px."
                )

            # 2. Kiểm tra tỷ lệ khung hình (Khuyến khích ảnh đứng chân dung)
            if aspect_ratio > 1.4:
                return ValidationResult(
                    is_valid=False,
                    error_code="INVALID_ASPECT_RATIO",
                    message=f"Ảnh có tỷ lệ ngang quá rộng (aspect ratio {aspect_ratio:.2f}). Vui lòng tải ảnh chân dung toàn thân hoặc bán thân đứng (tỷ lệ 3:4 hoặc 1:1)."
                )

            # 3. Đo độ mờ bằng phương sai toán tử vi phân Laplacian
            gray = cv2.cvtColor(cv_img, cv2.COLOR_BGR2GRAY)
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            is_blurry = laplacian_var < cls.MIN_LAPLACIAN_VAR

            if is_blurry:
                return ValidationResult(
                    is_valid=False,
                    error_code="BLURRY_IMAGE",
                    message=f"Ảnh bị rung mờ hoặc out nét nghiêm trọng (điểm rõ nét: {laplacian_var:.1f} < ngưỡng {cls.MIN_LAPLACIAN_VAR}). Hãy chụp lại ảnh rõ nét."
                )

            # 4. Kiểm tra độ sáng trung bình
            mean_luminance = float(np.mean(gray))
            is_underexposed = mean_luminance < cls.MIN_LUMINANCE
            is_overexposed = mean_luminance > cls.MAX_LUMINANCE

            if is_underexposed:
                return ValidationResult(
                    is_valid=False,
                    error_code="UNDER_EXPOSED",
                    message=f"Ảnh quá tối hoặc thiếu sáng (độ sáng {mean_luminance:.1f} < {cls.MIN_LUMINANCE}). Vui lòng chụp trong điều kiện ánh sáng tốt hơn."
                )
            if is_overexposed:
                return ValidationResult(
                    is_valid=False,
                    error_code="OVER_EXPOSED",
                    message=f"Ảnh bị lóa hoặc cháy sáng mạnh (độ sáng {mean_luminance:.1f} > {cls.MAX_LUMINANCE})."
                )

            # 5. Kiểm tra sơ bộ sự hiện diện của người (Vùng màu da trên không gian HSV)
            hsv = cv2.cvtColor(cv_img, cv2.COLOR_BGR2HSV)
            lower_skin = np.array([0, 25, 40], dtype=np.uint8)
            upper_skin = np.array([25, 200, 255], dtype=np.uint8)
            skin_mask = cv2.inRange(hsv, lower_skin, upper_skin)
            skin_percent = float((np.count_nonzero(skin_mask) / (w * h)) * 100.0)
            has_person = skin_percent >= cls.MIN_SKIN_PERCENT

            if not has_person:
                return ValidationResult(
                    is_valid=False,
                    error_code="NO_PERSON_DETECTED",
                    message="Không phát hiện thấy bóng dáng hoặc diện mạo người trong bức ảnh. Vui lòng chọn ảnh chụp người thật."
                )

            diagnostics = QualityDiagnostics(
                width=w,
                height=h,
                aspect_ratio=aspect_ratio,
                file_size_kb=round(file_size_kb, 1),
                blur_score=round(laplacian_var, 1),
                is_blurry=is_blurry,
                mean_luminance=round(mean_luminance, 1),
                is_underexposed=is_underexposed,
                is_overexposed=is_overexposed,
                skin_pixel_percent=round(skin_percent, 2),
                has_person_silhouette=has_person
            )

            return ValidationResult(
                is_valid=True,
                message="Ảnh người đạt chuẩn chất lượng cho thử đồ ảo AI.",
                diagnostics=diagnostics
            )

        except Exception as e:
            return ValidationResult(
                is_valid=False,
                error_code="PROCESSING_ERROR",
                message=f"Lỗi phân tích chất lượng ảnh: {str(e)}"
            )
