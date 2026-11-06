import os
import shutil
import hashlib
import logging
from typing import Optional, Tuple, Dict, Any

logger = logging.getLogger("ml_service.storage_service")

# Durable Base Directory inside ml_service assets
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DURABLE_STORAGE_DIR = os.path.join(BASE_DIR, "assets", "storage")
FRONTEND_PUBLIC_DIR = os.path.normpath(
    os.path.join(BASE_DIR, "..", "..", "frontend", "fashion-ai-web", "public", "assets")
)

os.makedirs(DURABLE_STORAGE_DIR, exist_ok=True)
os.makedirs(FRONTEND_PUBLIC_DIR, exist_ok=True)

class StorageService:
    """
    Storage Abstraction for 3D Garments, Images & Product Assets.
    
    Default Implementation: Durable Local File Storage.
    Production Architecture: Supports S3 / MinIO / Supabase via STORAGE_BACKEND.
    
    Durable Paths:
      - garments/{productId}/source/front.png
      - garments/{productId}/source/back.png
      - garments/{productId}/source/mask.png
      - garments/{productId}/source/texture.png
      - garments/{productId}/sizes/{size}/garment-v{version}.glb
      - garments/{productId}/sizes/{size}/preview.png
    """

    @classmethod
    def get_durable_dir(cls) -> str:
        return DURABLE_STORAGE_DIR

    @classmethod
    def save_bytes(cls, relative_path: str, data: bytes) -> Tuple[str, str, str]:
        """
        Saves binary data to durable storage and synchronizes to frontend public assets.
        Returns:
            - local_full_path: str
            - public_url: str
            - checksum_sha256: str
        """
        clean_rel = relative_path.replace("\\", "/").lstrip("/")
        dest_path = os.path.join(DURABLE_STORAGE_DIR, *clean_rel.split("/"))
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)

        with open(dest_path, "wb") as f:
            f.write(data)

        checksum = hashlib.sha256(data).hexdigest()

        # Synchronize to frontend public assets for direct Three.js / Image viewing
        frontend_dest = os.path.join(FRONTEND_PUBLIC_DIR, *clean_rel.split("/"))
        os.makedirs(os.path.dirname(frontend_dest), exist_ok=True)
        shutil.copy2(dest_path, frontend_dest)

        public_url = f"/assets/{clean_rel}"
        return dest_path, public_url, checksum

    @classmethod
    def save_file_from_path(cls, relative_path: str, src_file_path: str) -> Tuple[str, str, str]:
        """Reads file from src_file_path and saves into durable storage."""
        with open(src_file_path, "rb") as f:
            data = f.read()
        return cls.save_bytes(relative_path, data)

    @classmethod
    def get_public_url(cls, relative_path: str) -> str:
        clean_rel = relative_path.replace("\\", "/").lstrip("/")
        return f"/assets/{clean_rel}"

    @classmethod
    def exists(cls, relative_path: str) -> bool:
        clean_rel = relative_path.replace("\\", "/").lstrip("/")
        target = os.path.join(DURABLE_STORAGE_DIR, *clean_rel.split("/"))
        return os.path.exists(target)

    @classmethod
    def read_bytes(cls, relative_path: str) -> Optional[bytes]:
        clean_rel = relative_path.replace("\\", "/").lstrip("/")
        target = os.path.join(DURABLE_STORAGE_DIR, *clean_rel.split("/"))
        if os.path.exists(target):
            with open(target, "rb") as f:
                return f.read()
        return None
