from fastapi import APIRouter, HTTPException, status
import logging
from app.sizing.recommender import (
    ExplainableSizeRecommender,
    SizeRecommendationRequest,
    SizeRecommendationResponse
)

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/recommend", response_model=SizeRecommendationResponse)
async def recommend_size(payload: SizeRecommendationRequest):
    """
    Thuật toán đề xuất kích cỡ giải thích được (Explainable Size Recommendation).
    So khớp số đo nhân trắc học cơ thể với thông số may đo thành phẩm LifeWear,
    áp dụng hàm phạt bất đối xứng và độ cử động (ease allowance) theo danh mục.
    """
    try:
        response = ExplainableSizeRecommender.recommend(payload)
        return response
    except Exception as e:
        logger.error(f"Lỗi tính toán kích cỡ: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi thuật toán tính toán kích cỡ: {str(e)}"
        )
