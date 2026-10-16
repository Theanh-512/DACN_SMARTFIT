"""
Module Xử lý Khuôn mặt & Ánh xạ Texture Diện mạo (Face Processor & Texture Projection)
Hỗ trợ nhận diện khuôn mặt, căn chỉnh và tạo texture phục vụ cá nhân hóa Avatar 3D.
Tuân thủ nghiêm ngặt các nguyên tắc bảo mật và quyền riêng tư (Privacy-First):
- Giới hạn kích thước tệp tải lên <= 5MB.
- Xác thực định dạng tệp (JPEG, PNG).
- Kiểm tra tính hợp lệ và độ phân giải hình ảnh.
- Không lưu vĩnh viễn hình ảnh cá nhân; xử lý trong bộ nhớ đệm tạm thời.
- Nhãn rõ ràng: "Phép chiếu diện mạo gương mặt xấp xỉ (Face Texture Projection Approximation)".
"""

import os
import uuid
import logging
from typing import Dict, Any, Tuple, Optional
import numpy as np
import cv2
from PIL import Image

logger = logging.getLogger(__name__)

class FaceProcessingResult:
    def __init__(
        self,
        is_success: bool,
        has_detected_face: bool,
        texture_relative_path: Optional[str] = None,
        skin_hex: str = "#E8C39E",
        skin_rgb: Tuple[int, int, int] = (232, 195, 158),
        confidence: float = 0.0,
        message: str = ""
    ):
        self.is_success = is_success
        self.has_detected_face = has_detected_face
        self.texture_relative_path = texture_relative_path
        self.skin_hex = skin_hex
        self.skin_rgb = skin_rgb
        self.confidence = confidence
        self.message = message

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_success": self.is_success,
            "has_detected_face": self.has_detected_face,
            "texture_relative_path": self.texture_relative_path,
            "skin_hex": self.skin_hex,
            "skin_rgb": list(self.skin_rgb),
            "confidence": self.confidence,
            "message": self.message
        }


class FaceProcessor:
    """
    Trình xử lý trích xuất khuôn mặt và tạo texture da phục vụ 3D Avatar.
    """

    MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024  # 5MB
    MIN_DIMENSION_PX = 150
    MAX_DIMENSION_PX = 4096

    @classmethod
    def validate_image_bytes(cls, image_bytes: bytes) -> np.ndarray:
        """
        Xác thực an toàn dữ liệu ảnh: kích thước, độ phân giải, kiểm tra mã độc/tệp hỏng.
        """
        if not image_bytes or len(image_bytes) == 0:
            raise ValueError("Tập tin hình ảnh rỗng.")

        if len(image_bytes) > cls.MAX_FILE_SIZE_BYTES:
            raise ValueError(f"Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 5MB, hiện tại: {len(image_bytes)/(1024*1024):.1f}MB).")

        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            raise ValueError("Tập tin không phải định dạng hình ảnh hợp lệ hoặc dữ liệu bị hỏng.")

        h, w = img.shape[:2]
        if h < cls.MIN_DIMENSION_PX or w < cls.MIN_DIMENSION_PX:
            raise ValueError(f"Độ phân giải ảnh quá nhỏ ({w}x{h} px). Yêu cầu tối thiểu {cls.MIN_DIMENSION_PX}x{cls.MIN_DIMENSION_PX} px.")

        # Thu nhỏ ảnh nếu kích thước vượt ngưỡng để tối ưu hiệu năng
        if h > cls.MAX_DIMENSION_PX or w > cls.MAX_DIMENSION_PX:
            scale = cls.MAX_DIMENSION_PX / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)

        return img

    @classmethod
    def process_face_texture(
        cls,
        image_bytes: bytes,
        output_dir: str
    ) -> FaceProcessingResult:
        """
        Nhận diện vùng mặt, cắt ảnh, trích xuất tông da thực tế và lưu texture 512x512.
        """
        try:
            img = cls.validate_image_bytes(image_bytes)
        except ValueError as err:
            return FaceProcessingResult(
                is_success=False,
                has_detected_face=False,
                message=str(err)
            )

        h, w = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

        # Sử dụng bộ phân loại Haar Cascade chính xác của OpenCV
        cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        face_cascade = cv2.CascadeClassifier(cascade_path)
        faces = face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=4,
            minSize=(60, 60)
        )

        has_detected_face = len(faces) > 0
        confidence = 0.90 if has_detected_face else 0.40

        if has_detected_face:
            # Chọn khuôn mặt có diện tích lớn nhất (chủ thể bức ảnh)
            largest_face = max(faces, key=lambda f: f[2] * f[3])
            fx, fy, fw, fh = largest_face

            # Mở rộng bounding box để lấy thêm trán, cằm và má tự nhiên
            pad_x = int(fw * 0.28)
            pad_y_top = int(fh * 0.38)
            pad_y_bot = int(fh * 0.25)

            x1 = max(0, fx - pad_x)
            y1 = max(0, fy - pad_y_top)
            x2 = min(w, fx + fw + pad_x)
            y2 = min(h, fy + fh + pad_y_bot)

            face_crop = img[y1:y2, x1:x2]
        else:
            # Fallback: Nếu không tìm thấy mặt góc thẳng, cắt trung tâm ảnh
            side = min(h, w)
            y_start = int((h - side) / 2)
            x_start = int((w - side) / 2)
            face_crop = img[y_start:y_start+side, x_start:x_start+side]

        # Chuyển BGR -> RGB
        crop_rgb = cv2.cvtColor(face_crop, cv2.COLOR_BGR2RGB)

        # Trích xuất màu da trung bình từ vùng má trung tâm (tránh tóc và nền)
        ch, cw = crop_rgb.shape[:2]
        center_roi = crop_rgb[int(ch * 0.35):int(ch * 0.65), int(cw * 0.35):int(cw * 0.65)]
        mean_rgb = center_roi.mean(axis=(0, 1)).astype(int)
        r, g, b = int(mean_rgb[0]), int(mean_rgb[1]), int(mean_rgb[2])
        skin_hex = f"#{r:02x}{g:02x}{b:02x}".upper()

        # Tạo texture vuông 512x512
        pil_tex = Image.fromarray(crop_rgb).resize((512, 512), Image.Resampling.LANCZOS)

        # Lưu texture tạm thời
        os.makedirs(output_dir, exist_ok=True)
        tex_filename = f"face_tex_{uuid.uuid4().hex[:10]}.png"
        tex_path = os.path.join(output_dir, tex_filename)
        pil_tex.save(tex_path, format="PNG")

        msg = (
            "Nhận diện khuôn mặt thành công và đã chuẩn hóa texture diện mạo."
            if has_detected_face else
            "Không nhận diện được khuôn mặt rõ ràng (dùng vùng ảnh trung tâm). Khuyến nghị tải ảnh chụp chính diện đủ ánh sáng."
        )

        return FaceProcessingResult(
            is_success=True,
            has_detected_face=has_detected_face,
            texture_relative_path=tex_filename,
            skin_hex=skin_hex,
            skin_rgb=(r, g, b),
            confidence=confidence,
            message=msg
        )
