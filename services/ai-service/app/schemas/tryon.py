from pydantic import BaseModel, HttpUrl
from typing import Optional, Literal

class TryOnRequest(BaseModel):
    task_id: str
    person_image_url: str
    garment_image_url: str
    category: Literal["tops", "bottoms", "dresses", "one-pieces"] = "tops"
    num_inference_steps: int = 30
    seed: int = 42

class TryOnResponse(BaseModel):
    task_id: str
    status: Literal["success", "failed"]
    output_image_url: Optional[str] = None
    inference_time_ms: int
    error_message: Optional[str] = None
