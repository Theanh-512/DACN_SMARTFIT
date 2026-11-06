import os
import math
from typing import Dict, Any, Tuple, Optional
import numpy as np
from PIL import Image, ImageFilter

class TextureExtractor:
    """
    Extracts garment silhouette, foreground mask, dominant color, and fabric texture from flat product photos.
    Performs aspect ratio consistency checking against size chart and flags missing views.
    """

    @classmethod
    def process_garment_image(
        cls,
        image_path: str,
        size_spec: Optional[Dict[str, float]] = None,
        has_back_image: bool = False
    ) -> Dict[str, Any]:
        """
        Processes a garment image:
        - Segments foreground and extracts bounding silhouette.
        - Computes dominant hex color.
        - Compares photo aspect ratio vs size chart with 15% warning threshold.
        - Detects category candidate.
        """
        if not os.path.exists(image_path):
            return {
                "dominant_hex": "#19284B",
                "dominant_rgb": [25, 40, 75],
                "photo_aspect": 1.0,
                "aspect_warning": None,
                "category_detected": "tshirt",
                "missing_view_warning": "Ảnh sản phẩm không tồn tại.",
                "has_texture": False
            }

        img = Image.open(image_path).convert("RGBA")
        arr = np.array(img)

        # 1. Foreground Mask
        if arr[:, :, 3].min() < 250:
            fg_mask = arr[:, :, 3] > 30
        else:
            # Segment against white / near-white background
            lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
            fg_mask = lum < 242

        # Fallback if segmentation fails
        if not np.any(fg_mask):
            fg_mask = np.ones((arr.shape[0], arr.shape[1]), dtype=bool)

        # 2. Extract Dominant Color from Central Core ROI (Chest area)
        h, w = fg_mask.shape
        roi_mask = np.zeros_like(fg_mask)
        roi_mask[int(0.35 * h):int(0.70 * h), int(0.25 * w):int(0.75 * w)] = True
        sample_mask = fg_mask & roi_mask
        if not np.any(sample_mask):
            sample_mask = fg_mask

        fg_pixels = arr[sample_mask][:, :3]
        mean_rgb = np.median(fg_pixels, axis=0).astype(int)
        hex_color = f"#{mean_rgb[0]:02X}{mean_rgb[1]:02X}{mean_rgb[2]:02X}"

        # 3. Silhouette Bounding Box & Aspect Ratio
        y_indices, x_indices = np.where(fg_mask)
        if len(y_indices) > 0 and len(x_indices) > 0:
            box_w = float(np.max(x_indices) - np.min(x_indices) + 1)
            box_h = float(np.max(y_indices) - np.min(y_indices) + 1)
            photo_aspect = box_w / max(1.0, box_h)
        else:
            photo_aspect = 1.0

        # Heuristic category detection
        detected_cat = "tshirt"
        if photo_aspect > 1.15:
            detected_cat = "cardigan"
        elif photo_aspect < 0.85:
            detected_cat = "shirt"

        # 4. Aspect Ratio Consistency Verification
        aspect_warning = None
        if size_spec and "chest_width_cm" in size_spec and "body_length_cm" in size_spec:
            chart_aspect = (size_spec["chest_width_cm"] * 1.5) / max(1.0, size_spec["body_length_cm"])
            rel_dev = abs(photo_aspect - chart_aspect) / max(1e-4, chart_aspect)
            if rel_dev > 0.15:
                aspect_warning = {
                    "is_deviated": True,
                    "deviation_pct": round(rel_dev * 100.0, 1),
                    "photo_aspect": round(photo_aspect, 2),
                    "chart_aspect": round(chart_aspect, 2),
                    "message": f"Tỉ lệ ảnh sản phẩm ({photo_aspect:.2f}) lệch {rel_dev*100.0:.1f}% so với bảng size ({chart_aspect:.2f})."
                }

        # 5. Missing view warning
        missing_view_warning = None
        if not has_back_image:
            missing_view_warning = (
                "Chỉ có ảnh mặt trước. Mặt sau sẽ được suy diễn tự động (inferred) "
                "từ màu chủ đạo và chất liệu của mặt trước."
            )

        return {
            "dominant_hex": hex_color,
            "dominant_rgb": mean_rgb.tolist(),
            "photo_aspect": round(photo_aspect, 3),
            "aspect_warning": aspect_warning,
            "category_detected": detected_cat,
            "missing_view_warning": missing_view_warning,
            "has_texture": True
        }

    @classmethod
    def generate_mask_and_texture_files(
        cls,
        image_path: str,
        mask_out_path: str,
        texture_out_path: str
    ) -> Tuple[bool, bool]:
        """
        Saves a distinct binary mask image and texture map image to given output paths.
        """
        try:
            if not os.path.exists(image_path):
                return False, False

            img = Image.open(image_path).convert("RGBA")
            arr = np.array(img)

            # Segmentation
            if arr[:, :, 3].min() < 250:
                fg_mask = arr[:, :, 3] > 30
            else:
                lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
                fg_mask = lum < 242

            # 1. Mask image (White foreground on Black background)
            mask_arr = np.where(fg_mask, 255, 0).astype(np.uint8)
            mask_img = Image.fromarray(mask_arr, mode="L")
            os.makedirs(os.path.dirname(os.path.abspath(mask_out_path)), exist_ok=True)
            mask_img.save(mask_out_path, format="PNG")

            # 2. Texture image (Crop / Clean transparent foreground)
            tex_arr = arr.copy()
            tex_arr[~fg_mask] = [0, 0, 0, 0]
            tex_img = Image.fromarray(tex_arr, mode="RGBA")
            os.makedirs(os.path.dirname(os.path.abspath(texture_out_path)), exist_ok=True)
            tex_img.save(texture_out_path, format="PNG")

            return True, True
        except Exception as e:
            return False, False
