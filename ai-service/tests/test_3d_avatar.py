import unittest
import numpy as np
import cv2
from fastapi.testclient import TestClient
from app.main import app
from app.anthropometry.iso_measurements import FocusedAnthropometryExtractor, Iso8559Measurements
from app.anthropometry.mesh_generator import SmplxMeshGenerator
from app.anthropometry.face_processor import FaceProcessor

class Test3DAvatarAndFitting(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    # 1. KIỂM THỬ ƯỚC LƯỢNG BETAS & CHUẨN ISO 8559
    def test_betas_estimation(self):
        betas = FocusedAnthropometryExtractor.estimate_betas_from_metrics(
            height_cm=175.0,
            weight_kg=72.0,
            body_type="mesomorph"
        )
        self.assertEqual(len(betas), 10)
        self.assertIsInstance(betas[0], float)

    def test_iso8559_calculation(self):
        betas = [0.1, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]
        iso = FocusedAnthropometryExtractor.calculate_iso8559_from_betas(betas, base_height_cm=175.0)
        self.assertGreater(iso.height_cm, 170.0)
        self.assertGreater(iso.chest_cm, 85.0)
        self.assertGreater(iso.waist_cm, 70.0)
        self.assertGreater(iso.shoulder_cm, 40.0)

    # 2. KIỂM THỬ CÁC PRESETS HÌNH THỂ CHUẨN HÓA (BODY ARCHETYPES)
    def test_gender_presets_alter_betas_and_geometry(self):
        # Kiểm tra các preset nam & nữ phải có tham số betas khác biệt rõ rệt
        presets = SmplxMeshGenerator.PRESET_BETAS
        self.assertIn("male_regular", presets)
        self.assertIn("male_athletic", presets)
        self.assertIn("male_broad", presets)
        self.assertIn("female_regular", presets)
        self.assertIn("female_hourglass", presets)

        # Athletic phải có ngực & vai lớn hơn regular
        self.assertGreater(presets["male_athletic"][2], presets["male_regular"][2])
        self.assertGreater(presets["male_athletic"][5], presets["male_regular"][5])

        # Hourglass phải có eo thắt hơn regular
        self.assertLess(presets["female_hourglass"][3], presets["female_regular"][3])

    # 3. KIỂM THỬ XỬ LÝ KHUÔN MẶT & BẢO MẬT DỮ LIỆU (PRIVACY & VALIDATION)
    def test_face_processor_rejects_empty_and_corrupt(self):
        with self.assertRaises(ValueError):
            FaceProcessor.validate_image_bytes(b"")

        with self.assertRaises(ValueError):
            FaceProcessor.validate_image_bytes(b"not-an-image-data")

    def test_face_processor_valid_image(self):
        # Tạo ảnh hợp lệ 300x300 có màu da
        img = np.full((300, 300, 3), (160, 195, 235), dtype=np.uint8)
        _, encoded = cv2.imencode('.jpg', img)

        res = FaceProcessor.process_face_texture(encoded.tobytes(), "data/results/textures")
        self.assertTrue(res.is_success)
        self.assertTrue(res.skin_hex.startswith("#"))
        self.assertEqual(len(res.skin_rgb), 3)

    def test_upload_photo_requires_user_consent(self):
        # Tạo ảnh hợp lệ
        img = np.full((300, 300, 3), (160, 195, 235), dtype=np.uint8)
        _, encoded = cv2.imencode('.jpg', img)

        # Gửi request với user_consent = False
        res = self.client.post(
            "/internal/v1/avatar/upload-photo-reconstruct",
            files={"person_image": ("test.jpg", encoded.tobytes(), "image/jpeg")},
            data={"user_consent": "false"}
        )
        self.assertEqual(res.status_code, 400)
        self.assertIn("đồng ý", res.json()["detail"].lower())

    def test_delete_avatar_data_endpoint(self):
        res = self.client.post("/internal/v1/avatar/delete-data", data={"texture_relative_path": "non_existent.png"})
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["status"] == "success")

    # 4. KIỂM THỬ DỰNG LƯỚI & THỬ ĐỒ 3D
    def test_reconstruct_api_endpoint(self):
        payload = {
            "height_cm": 178.0,
            "weight_kg": 75.0,
            "gender": "male",
            "preset_key": "male_athletic",
            "body_type": "regular",
            "skin_tone": "asian"
        }
        res = self.client.post("/internal/v1/avatar/reconstruct", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("glb_url", data)
        self.assertTrue(data["glb_url"].endswith(".glb"))
        self.assertEqual(len(data["betas"]), 10)
        self.assertIn("iso_measurements", data)
        self.assertEqual(data["preset_key"], "male_athletic")

    def test_tryon_3d_and_tight_warning(self):
        # Người to thử áo Size S (chật)
        betas = SmplxMeshGenerator.PRESET_BETAS["male_broad"]
        payload = {
            "betas": betas,
            "height_cm": 180.0,
            "gender": "male",
            "preset_key": "male_broad",
            "product_id": "test-tshirt",
            "product_name": "Áo Thun Cotton Cổ Tròn",
            "category_id": "cat-tshirts",
            "size": "S",
            "garment_color": "navy",
            "skin_tone": "asian",
            "show_heatmap": True
        }
        res = self.client.post("/internal/v1/avatar/tryon-3d", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("scene_glb_url", data)
        self.assertTrue(data["fit_diagnostic"]["is_tight"])
        self.assertEqual(data["fit_diagnostic"]["recommended_size_action"], "size_up")

    # 5. KIỂM THỬ DỊCH VỤ TƯ VẤN KÍCH CỠ GIẢI THÍCH ĐƯỢC (EXPLAINABLE SIZING)
    def test_explainable_sizing_service(self):
        payload = {
            "category_id": "cat-tshirts",
            "fit_preference": "regular",
            "measurements": {
                "height_cm": 175.0,
                "weight_kg": 70.0,
                "chest_cm": 96.0,
                "waist_cm": 80.0
            }
        }
        res = self.client.post("/api/v1/sizing/recommend", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn(data["recommended_size"], ["M", "L"])
        self.assertGreater(data["confidence_score"], 80.0)
        self.assertTrue(len(data["measurement_breakdown"]) > 0)

if __name__ == "__main__":
    unittest.main()
