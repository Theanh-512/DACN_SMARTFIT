import os

try:
    from pydantic_settings import BaseSettings
    class Settings(BaseSettings):
        PROJECT_NAME: str = "Fashion AI Service (IDM-VTON & SigLIP Search)"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/internal/v1"
        INTERNAL_API_KEY: str = os.getenv("AI_INTERNAL_API_KEY", "fashion_ai_internal_secret_token_2026")
        DEVICE: str = os.getenv("AI_DEVICE", "cuda" if os.getenv("USE_CUDA", "0") == "1" else "cpu")
        SIGLIP_MODEL_NAME: str = os.getenv("SIGLIP_MODEL_NAME", "google/siglip-base-patch16-224")
        IDM_VTON_CHECKPOINT: str = os.getenv("IDM_VTON_CHECKPOINT", "yisol/IDM-VTON")
        FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "data/catalog_index.faiss")

        class Config:
            env_file = ".env"
            extra = "ignore"
except ImportError:
    class Settings:
        PROJECT_NAME: str = "Fashion AI Service (IDM-VTON & SigLIP Search)"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/internal/v1"
        INTERNAL_API_KEY: str = os.getenv("AI_INTERNAL_API_KEY", "fashion_ai_internal_secret_token_2026")
        DEVICE: str = os.getenv("AI_DEVICE", "cuda" if os.getenv("USE_CUDA", "0") == "1" else "cpu")
        SIGLIP_MODEL_NAME: str = os.getenv("SIGLIP_MODEL_NAME", "google/siglip-base-patch16-224")
        IDM_VTON_CHECKPOINT: str = os.getenv("IDM_VTON_CHECKPOINT", "yisol/IDM-VTON")
        FAISS_INDEX_PATH: str = os.getenv("FAISS_INDEX_PATH", "data/catalog_index.faiss")

settings = Settings()
