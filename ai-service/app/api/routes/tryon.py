from fastapi import APIRouter, HTTPException, Header, status
from app.schemas.tryon import TryOnRequest, TryOnResponse
from app.core.config import settings
import time

router = APIRouter()

@router.post("/inference", response_model=TryOnResponse)
async def run_tryon_inference(
    payload: TryOnRequest,
    x_internal_token: str = Header(None)
):
    if x_internal_token != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal service token"
        )
    
    start_time = time.time()
    
    # Placeholder for IDM-VTON inference execution
    # Pipeline wrapper will be invoked in Phase 3
    elapsed_ms = int((time.time() - start_time) * 1000)
    
    return TryOnResponse(
        task_id=payload.task_id,
        status="success",
        output_image_url=payload.person_image_url,
        inference_time_ms=elapsed_ms
    )
