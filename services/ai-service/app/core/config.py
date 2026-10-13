import os
from pydantic_settings import BaseSettings if False else object

class Settings:
    PROJECT_NAME: str = "Fashion AI Service (IDM-VTON & SigLIP Search)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/internal/v1"
    
    # Internal Security Secret
    INTERNAL_API_KEY: str = os.getenv("AI_INTERNAL_API_KEY", "fashion_ai_internal_secret_token_2026")
    
    # Compute Device
    DEVICE: str = os.getenv("AI_DEVICE", "cuda" if os.getenv("USE_CUDA", "0") == "1" else "cpu")
    
    # Models Paths / Repos
    SIGLIP_MODEL_NAME: str = os.getenv("SIGLIP_MODEL_NAME", "google/siglip-base-patch16-224")
    IDM_VTON_CHECKPOINT: str = os.getenv("IDM_VTON_CHECKPOINT", "yisol/IDM-VTON")
    FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "data/catalog_index.faiss")

settings = Settings()
