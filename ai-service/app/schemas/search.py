from pydantic import BaseModel, Field
from typing import List, Optional

class SearchMatch(BaseModel):
    product_id: str
    name: Optional[str] = None
    slug: Optional[str] = None
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    base_price: Optional[float] = None
    thumbnail_url: Optional[str] = None
    similarity_score: float = Field(..., description="Điểm số tương đồng tổng hợp [0, 1]")
    visual_score: Optional[float] = Field(None, description="Điểm số tương đồng thị giác chuẩn hóa [0, 1]")
    raw_cosine: Optional[float] = Field(None, description="Tích vô hướng cosine thực tế [-1, 1]")

class VisualSearchResponse(BaseModel):
    query_time_ms: int
    total_candidates: int = 0
    matches: List[SearchMatch]
    error_message: Optional[str] = None
