from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form, status
from app.schemas.search import VisualSearchResponse, SearchMatch
from app.core.config import settings
import time

router = APIRouter()

@router.post("/visual", response_model=VisualSearchResponse)
async def search_by_image(
    image: UploadFile = File(...),
    limit: int = Form(10),
    x_internal_token: str = Header(None)
):
    if x_internal_token != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal service token"
        )
    
    start_time = time.time()
    
    # Placeholder for SigLIP embedding extraction and FAISS index search
    # Vector retrieval will be hooked in Phase 3
    elapsed_ms = int((time.time() - start_time) * 1000)
    
    return VisualSearchResponse(
        query_time_ms=elapsed_ms,
        matches=[]
    )
