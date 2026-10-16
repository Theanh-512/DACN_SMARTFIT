import os
import json
import io
import time
import urllib.request
import logging
from typing import List, Dict, Any, Optional
import numpy as np
from PIL import Image

from app.visual_search.extractor import VisualFeatureExtractor

logger = logging.getLogger(__name__)

class CatalogVisualIndexer:
    """
    Quản lý kho chỉ mục vector embedding của toàn bộ danh mục sản phẩm thời trang.
    Cung cấp các phương thức tìm kiếm tương đồng vector Cosine, xếp hạng lai (Hybrid Ranking)
    và lọc theo các tiêu chí nghiệp vụ (danh mục, khoảng giá, tình trạng hàng).
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self, data_dir: str = None):
        if data_dir is None:
            # Đường dẫn tương đối từ vị trí file tới thư mục data/
            base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
            self.data_dir = os.path.join(base_dir, "data")
        else:
            self.data_dir = data_dir

        os.makedirs(self.data_dir, exist_ok=True)
        self.embeddings_path = os.path.join(self.data_dir, "catalog_embeddings.npz")
        self.metadata_path = os.path.join(self.data_dir, "catalog_metadata.json")

        self.extractor = VisualFeatureExtractor.get_instance()
        self.embeddings: Optional[np.ndarray] = None  # Shape: (N, 576)
        self.metadata: List[Dict[str, Any]] = []      # Danh sách N dicts
        self.product_id_to_idx: Dict[str, int] = {}

        self.load_index()

    def is_indexed(self) -> bool:
        return self.embeddings is not None and len(self.metadata) > 0

    def load_index(self) -> bool:
        """
        Nạp ma trận embedding và metadata từ đĩa vào bộ nhớ RAM.
        """
        if os.path.exists(self.embeddings_path) and os.path.exists(self.metadata_path):
            try:
                npz = np.load(self.embeddings_path)
                self.embeddings = npz["embeddings"]
                with open(self.metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                
                self.product_id_to_idx = {m["id"]: i for i, m in enumerate(self.metadata)}
                logger.info(f"Đã nạp thành công chỉ mục {len(self.metadata)} sản phẩm (shape: {self.embeddings.shape}).")
                return True
            except Exception as e:
                logger.error(f"Lỗi khi đọc file chỉ mục: {e}")
                return False
        return False

    def build_index_from_catalog(self, products: List[Dict[str, Any]]) -> int:
        """
        Xây dựng chỉ mục vector từ danh sách sản phẩm.
        Tải ảnh đại diện, trích xuất vector embedding L2 và lưu trữ vào file.
        """
        logger.info(f"Bắt đầu xây dựng chỉ mục cho {len(products)} sản phẩm...")
        embeddings_list = []
        valid_metadata = []

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }

        for i, prod in enumerate(products):
            prod_id = prod.get("id", f"prod-{i:03d}")
            name = prod.get("name", "Sản phẩm")
            img_url = prod.get("thumbnailUrl") or (prod.get("images", [])[0] if prod.get("images") else None)

            if not img_url:
                continue

            try:
                req = urllib.request.Request(img_url, headers=headers)
                with urllib.request.urlopen(req, timeout=8) as response:
                    img_bytes = response.read()
                    feat = self.extractor.extract_from_bytes(img_bytes)
                    embeddings_list.append(feat)
                    valid_metadata.append({
                        "id": prod_id,
                        "name": name,
                        "slug": prod.get("slug", ""),
                        "categoryId": prod.get("categoryId", ""),
                        "categoryName": prod.get("categoryName", ""),
                        "basePrice": prod.get("basePrice", 0),
                        "thumbnailUrl": img_url,
                        "color": prod.get("variants", [{}])[0].get("color", "") if prod.get("variants") else ""
                    })
                    logger.info(f"[{i+1}/{len(products)}] Đã trích xuất embedding: {prod_id} - {name[:30]}")
            except Exception as err:
                logger.warning(f"Không thể tải ảnh cho {prod_id} ({img_url}): {err}. Tạo vector ngẫu nhiên xác định theo seed.")
                # Tạo vector giả lập có tính xác định theo hash của id để bảo toàn kích thước chỉ mục
                np.random.seed(abs(hash(prod_id)) % (2**32))
                dummy = np.random.randn(self.extractor.embedding_dim).astype(np.float32)
                dummy = dummy / (np.linalg.norm(dummy) + 1e-7)
                embeddings_list.append(dummy)
                valid_metadata.append({
                    "id": prod_id,
                    "name": name,
                    "slug": prod.get("slug", ""),
                    "categoryId": prod.get("categoryId", ""),
                    "categoryName": prod.get("categoryName", ""),
                    "basePrice": prod.get("basePrice", 0),
                    "thumbnailUrl": img_url,
                    "color": prod.get("variants", [{}])[0].get("color", "") if prod.get("variants") else ""
                })

        if embeddings_list:
            self.embeddings = np.array(embeddings_list, dtype=np.float32)
            self.metadata = valid_metadata
            self.product_id_to_idx = {m["id"]: i for i, m in enumerate(self.metadata)}

            # Lưu vào đĩa
            np.savez_compressed(self.embeddings_path, embeddings=self.embeddings)
            with open(self.metadata_path, "w", encoding="utf-8") as f:
                json.dump(self.metadata, f, ensure_ascii=False, indent=2)

            logger.info(f"Hoàn thành lập chỉ mục {len(self.metadata)} sản phẩm!")
            return len(self.metadata)
        return 0

    def search(
        self,
        query_embedding: np.ndarray,
        top_k: int = 10,
        category_id: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        alpha_visual: float = 1.0  # 1.0: thuần thị giác, <1.0: kết hợp thuộc tính danh mục
    ) -> List[Dict[str, Any]]:
        """
        Tìm kiếm Top-K sản phẩm có độ tương đồng thị giác cao nhất.
        Hỗ trợ Hybrid Ranking:
          FinalScore = alpha * CosineSim + (1 - alpha) * CategoryMatchBonus
        """
        if not self.is_indexed():
            return []

        # Tích vô hướng giữa query vector và ma trận chỉ mục (Cosine Similarity do cả 2 đều đã L2-norm)
        # sim shape: (N,)
        sim_scores = np.dot(self.embeddings, query_embedding)

        # Chuyển đổi từ [-1, 1] sang thang đo [0.0, 1.0]
        # Đối với ảnh thời trang cùng miền, cosine thường nằm trong khoảng [0.3, 0.98]
        norm_scores = np.clip((sim_scores + 1.0) / 2.0, 0.0, 1.0)

        results = []
        for idx, item in enumerate(self.metadata):
            # Bộ lọc danh mục nếu người dùng chọn
            if category_id and item.get("categoryId") != category_id:
                continue

            price = item.get("basePrice", 0)
            if min_price is not None and price < min_price:
                continue
            if max_price is not None and price > max_price:
                continue

            visual_score = float(norm_scores[idx])
            
            # Tính điểm tương thích thuộc tính
            attr_score = 1.0
            if category_id and item.get("categoryId") == category_id:
                attr_score = 1.0
            else:
                attr_score = 0.5

            final_score = alpha_visual * visual_score + (1.0 - alpha_visual) * attr_score

            results.append({
                "product_id": item["id"],
                "name": item["name"],
                "slug": item.get("slug", ""),
                "category_id": item.get("categoryId", ""),
                "category_name": item.get("categoryName", ""),
                "base_price": item.get("basePrice", 0),
                "thumbnail_url": item.get("thumbnailUrl", ""),
                "similarity_score": round(final_score, 4),
                "visual_score": round(visual_score, 4),
                "raw_cosine": round(float(sim_scores[idx]), 4)
            })

        # Sắp xếp giảm dần theo điểm số cuối cùng
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]
