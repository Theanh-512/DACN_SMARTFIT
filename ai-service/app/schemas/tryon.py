from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Dict, Any, Literal

class TryOnRequest(BaseModel):
    task_id: Optional[str] = None
    product_id: Optional[str] = None
    variant_id: Optional[str] = None
    person_image_url: Optional[str] = None
    garment_image_url: Optional[str] = None
    category: Literal["tops", "bottoms", "dresses", "one-pieces"] = "tops"
    num_inference_steps: int = 30
    seed: int = 42

class TryOnResponse(BaseModel):
    task_id: str
    status: Literal["queued", "validating", "inferencing", "succeeded", "failed"]
    output_image_url: Optional[str] = None
    inference_time_ms: int = 0
    timings: Dict[str, int] = Field(default_factory=dict)
    diagnostics: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
