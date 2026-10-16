from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form, status
from typing import Optional
import time
import urllib.request
import logging

from app.schemas.search import VisualSearchResponse, SearchMatch
from app.visual_search.extractor import VisualFeatureExtractor
from app.visual_search.catalog_indexer import CatalogVisualIndexer
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/visual", response_model=VisualSearchResponse)
async def search_by_image(
    image: Optional[UploadFile] = File(None),
    image_url: Optional[str] = Form(None),
    category_id: Optional[str] = Form(None),
    min_price: Optional[float] = Form(None),
    max_price: Optional[float] = Form(None),
    alpha_visual: float = Form(1.0),
    limit: int = Form(10),
    x_internal_token: Optional[str] = Header(None)
):
    """
    Truy vấn tìm kiếm trang phục tương đồng thị giác dựa trên Deep Visual Embeddings.
    Hỗ trợ tải lên ảnh trực tiếp hoặc cung cấp URL hình ảnh, lọc theo danh mục / giá
    và xếp hạng kết hợp (Hybrid Ranking).
    """
    # Nếu có cấu hình token nội bộ thì kiểm tra (cho phép bỏ qua nếu gọi từ frontend cùng mạng)
    if x_internal_token and x_internal_token != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã định danh bảo mật nội bộ không hợp lệ."
        )

    if not image and not image_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vui lòng cung cấp file ảnh tải lên hoặc image_url để tìm kiếm."
        )

    start_time = time.time()
    extractor = VisualFeatureExtractor.get_instance()
    indexer = CatalogVisualIndexer.get_instance()

    if not indexer.is_indexed():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Chỉ mục vector danh mục sản phẩm chưa sẵn sàng."
        )

    try:
        # Lấy dữ liệu bytes của ảnh truy vấn
        if image:
            image_bytes = await image.read()
        else:
            headers = {"User-Agent": "Mozilla/5.0"}
            req = urllib.request.Request(image_url, headers=headers)
            with urllib.request.urlopen(req, timeout=8) as resp:
                image_bytes = resp.read()

        # 1. Trích xuất vector đặc trưng L2
        query_embedding = extractor.extract_from_bytes(image_bytes)

        # 2. Truy vấn Cosine / Hybrid Ranking trên kho chỉ mục
        raw_matches = indexer.search(
            query_embedding=query_embedding,
            top_k=limit,
            category_id=category_id,
            min_price=min_price,
            max_price=max_price,
            alpha_visual=alpha_visual
        )

        elapsed_ms = int((time.time() - start_time) * 1000)

        matches = [
            SearchMatch(
                product_id=m["product_id"],
                name=m["name"],
                slug=m["slug"],
                category_id=m["category_id"],
                category_name=m["category_name"],
                base_price=m["base_price"],
                thumbnail_url=m["thumbnail_url"],
                similarity_score=m["similarity_score"],
                visual_score=m["visual_score"],
                raw_cosine=m["raw_cosine"]
            )
            for m in raw_matches
        ]

        return VisualSearchResponse(
            query_time_ms=elapsed_ms,
            total_candidates=len(indexer.metadata),
            matches=matches
        )

    except Exception as e:
        logger.error(f"Lỗi xử lý tìm kiếm ảnh: {e}", exc_info=True)
        elapsed_ms = int((time.time() - start_time) * 1000)
        return VisualSearchResponse(
            query_time_ms=elapsed_ms,
            total_candidates=len(indexer.metadata) if indexer.is_indexed() else 0,
            matches=[],
            error_message=f"Lỗi xử lý hình ảnh: {str(e)}"
        )
