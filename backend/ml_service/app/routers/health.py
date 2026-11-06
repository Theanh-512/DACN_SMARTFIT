from fastapi import APIRouter
from core.body_model import BodyModel

router = APIRouter(tags=["System"])

# Cached instance to inspect status
_body_model = None

def get_body_model():
    global _body_model
    if _body_model is None:
        _body_model = BodyModel()
    return _body_model

@router.get("/health")
def health_check():
    model = get_body_model()
    smpl_mode = "mock" if model.is_mock else f"official_{model.model_type}"
    return {
        "status": "ok",
        "service": "ml_service",
        "smplx_mode": smpl_mode,
        "model_type": model.model_type,
        "is_mock": model.is_mock,
        "num_vertices": model.num_vertices,
        "device": model.device,
        "version": "1.0.0"
    }
