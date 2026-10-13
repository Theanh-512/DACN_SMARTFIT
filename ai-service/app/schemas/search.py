from pydantic import BaseModel
from typing import List, Optional

class SearchMatch(BaseModel):
    product_id: str
    similarity_score: float

class VisualSearchResponse(BaseModel):
    query_time_ms: int
    matches: List[SearchMatch]
    error_message: Optional[str] = None
