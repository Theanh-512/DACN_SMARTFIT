import os
import sys
import unittest
import numpy as np
import cv2

# Add ai-service to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
AI_SERVICE_DIR = os.path.dirname(CURRENT_DIR)
sys.path.insert(0, AI_SERVICE_DIR)

from app.tryon.validator import TryOnInputValidator
from app.visual_search.extractor import VisualFeatureExtractor
from app.visual_search.catalog_indexer import CatalogVisualIndexer
from app.sizing.recommender import (
    ExplainableSizeRecommender,
    SizeRecommendationRequest,
    BodyMeasurements
)
from app.main import app
from starlette.testclient import TestClient

class TestAiContributions(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    # 1. KIỂM THỬ BỘ LỌC CHẤT LƯỢNG VTON (TRYON INPUT VALIDATOR)
    def test_validator_rejects_blurry_image(self):
        # Tạo ảnh mờ bằng Gaussian blur
        img = np.random.randint(50, 200, (600, 600, 3), dtype=np.uint8)
        blurred = cv2.GaussianBlur(img, (51, 51), 0)
        _, encoded = cv2.imencode('.jpg', blurred)
        
        result = TryOnInputValidator.validate_person_image(encoded.tobytes())
        self.assertFalse(result.is_valid)
        self.assertEqual(result.error_code, "BLURRY_IMAGE")

    def test_validator_rejects_extreme_landscape(self):
        # Tạo ảnh tỷ lệ 16:9 ngang
        img = np.full((400, 800, 3), 120, dtype=np.uint8)
        _, encoded = cv2.imencode('.jpg', img)
        
        result = TryOnInputValidator.validate_person_image(encoded.tobytes())
        self.assertFalse(result.is_valid)
        self.assertEqual(result.error_code, "INVALID_ASPECT_RATIO")

    def test_validator_rejects_underexposed_image(self):
        # Tạo ảnh quá tối (luminance < 35)
        img = np.full((600, 600, 3), 10, dtype=np.uint8)
        _, encoded = cv2.imencode('.jpg', img)
        
        result = TryOnInputValidator.validate_person_image(encoded.tobytes())
        self.assertFalse(result.is_valid)
        self.assertIn(result.error_code, ["UNDER_EXPOSED", "BLURRY_IMAGE"])

    # 2. KIỂM THỬ TRÍCH XUẤT ĐẶC TRƯNG VÀ LẬP CHỈ MỤC (VISUAL SEARCH)
    def test_feature_extractor_l2_normalization(self):
        extractor = VisualFeatureExtractor.get_instance()
        # Tạo ảnh giả lập
        img = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        _, encoded = cv2.imencode('.jpg', img)
        
        feat = extractor.extract_from_bytes(encoded.tobytes())
        self.assertEqual(feat.shape, (576,))
        # Kiểm tra chuẩn L2 norm phải bằng 1.0 (sai số < 1e-4)
        norm = np.linalg.norm(feat)
        self.assertAlmostEqual(norm, 1.0, places=4)

    def test_catalog_indexer_cosine_ranking(self):
        indexer = CatalogVisualIndexer.get_instance()
        self.assertTrue(indexer.is_indexed())
        self.assertGreater(len(indexer.metadata), 0)

        # Lấy vector mẫu đầu tiên làm query
        q = indexer.embeddings[0]
        results = indexer.search(q, top_k=5, alpha_visual=1.0)
        
        self.assertGreater(len(results), 0)
        # Kết quả top-1 phải là chính sản phẩm đó với độ tương đồng ~ 1.0
        self.assertEqual(results[0]["product_id"], indexer.metadata[0]["id"])
        self.assertAlmostEqual(results[0]["similarity_score"], 1.0, places=2)

    # 3. KIỂM THỬ THUẬT TOÁN GỢI Ý KÍCH CỠ GIẢI THÍCH ĐƯỢC
    def test_size_recommender_regular_fit(self):
        req = SizeRecommendationRequest(
            category_id="cat-tshirts",
            fit_preference="regular",
            measurements=BodyMeasurements(
                height_cm=170,
                weight_kg=62,
                chest_cm=92
            )
        )
        res = ExplainableSizeRecommender.recommend(req)
        self.assertEqual(res.recommended_size, "M")
        self.assertGreater(res.confidence_score, 80.0)
        self.assertIn("vòng ngực", res.explanation.lower())

    def test_size_recommender_asymmetric_penalty_for_tight_size(self):
        # Người có ngực 115cm thử chọn áo thun size S (ngực áo 94cm -> thiếu 21cm)
        req = SizeRecommendationRequest(
            category_id="cat-tshirts",
            fit_preference="regular",
            measurements=BodyMeasurements(
                height_cm=185,
                weight_kg=95,
                chest_cm=115
            )
        )
        res = ExplainableSizeRecommender.recommend(req)
        # Hệ thống không bao giờ được khuyên size S
        self.assertNotEqual(res.recommended_size, "S")
        self.assertIn(res.recommended_size, ["XL", "XXL"])

    # 4. KIỂM THỬ TÍCH HỢP REST API (FASTAPI ENDPOINTS)
    def test_api_health_endpoint(self):
        resp = self.client.get("/health")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()["status"], "healthy")

    def test_api_sizing_endpoint(self):
        payload = {
            "category_id": "cat-jackets",
            "fit_preference": "regular",
            "measurements": {
                "height_cm": 172,
                "weight_kg": 68,
                "chest_cm": 95
            }
        }
        resp = self.client.post("/internal/v1/sizing/recommend", json=payload)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertIn("recommended_size", data)
        self.assertIn("confidence_score", data)
        self.assertIn("explanation", data)

if __name__ == "__main__":
    unittest.main()
