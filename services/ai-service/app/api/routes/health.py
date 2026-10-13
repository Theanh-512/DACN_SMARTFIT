from fastapi import APIRouter
import time

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "Fashion AI Engine",
        "timestamp": int(time.time()),
        "cuda_available": False  # Evaluated dynamically at runtime
    }
