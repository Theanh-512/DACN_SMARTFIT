import os
import io
import json
import pytest
from PIL import Image
import numpy as np

from core.storage_service import StorageService
from core.catalog_repository import CatalogRepository
from core.pattern_generator import ParametricPatternGenerator
from core.texture_extractor import TextureExtractor
from app.schemas.garment_catalog import (
    GarmentProductSchema,
    GarmentVariantSchema,
    GarmentAssetSchema,
    GarmentGenerationRequest
)
from app.routers.garment import generate_garment_3d, publish_garment_product, PublishProductRequest

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

@pytest.fixture
def sample_front_image():
    """Generates a synthetic flat garment image (navy rectangle with neckline)."""
    img = Image.new("RGBA", (400, 500), (255, 255, 255, 255))
    pixels = np.array(img)
    # Garment torso in navy blue
    pixels[80:450, 100:300] = [25, 40, 75, 255]
    # Neckline cut
    pixels[80:120, 160:240] = [255, 255, 255, 255]
    img = Image.fromarray(pixels)
    
    img_path = os.path.join(StorageService.get_durable_dir(), "test_sample_front.png")
    img.save(img_path, format="PNG")
    yield img_path
    if os.path.exists(img_path):
        os.remove(img_path)

def test_pattern_generator_all_mvp_categories():
    """Verify parametric pattern generation for all 4 MVP categories: tshirt, shirt, cardigan, jacket."""
    spec = {
        "chest_width_cm": 50.0,
        "body_length_cm": 69.0,
        "shoulder_width_cm": 45.0,
        "sleeve_length_cm": 58.0,
        "hem_width_cm": 49.0,
        "neck_circ_cm": 41.0
    }
    categories = ["tshirt", "shirt", "cardigan", "jacket"]
    for cat in categories:
        res = ParametricPatternGenerator.generate_pattern(cat, spec)
        assert res["garment_type"] == cat
        assert "pieces" in res
        assert "front" in res["pieces"] or "front_left" in res["pieces"]
        assert "back" in res["pieces"]
        assert "sleeve_left" in res["pieces"]

def test_texture_extractor_mask_and_view_warning(sample_front_image):
    """Verify mask/texture extraction and warning when back view is missing."""
    analysis = TextureExtractor.process_garment_image(
        image_path=sample_front_image,
        size_spec={"chest_width_cm": 50.0, "body_length_cm": 69.0},
        has_back_image=False
    )
    assert analysis["dominant_hex"].startswith("#")
    assert "missing_view_warning" in analysis
    assert "Mặt sau sẽ được suy diễn tự động" in analysis["missing_view_warning"]

    mask_path = os.path.join(StorageService.get_durable_dir(), "test_mask.png")
    tex_path = os.path.join(StorageService.get_durable_dir(), "test_tex.png")
    ok_m, ok_t = TextureExtractor.generate_mask_and_texture_files(sample_front_image, mask_path, tex_path)
    assert ok_m is True and ok_t is True
    assert os.path.exists(mask_path)
    assert os.path.exists(tex_path)
    if os.path.exists(mask_path): os.remove(mask_path)
    if os.path.exists(tex_path): os.remove(tex_path)

def test_storage_service_durable_sync():
    """Verify StorageService saves durable files and synchronizes with public assets."""
    data = b"Test 3D Garment Model Binary Data"
    rel_path = "garments/test_prod_001/sizes/M/garment-v1.glb"
    dest, pub_url, checksum = StorageService.save_bytes(rel_path, data)

    assert os.path.exists(dest)
    assert pub_url == f"/assets/{rel_path}"
    assert len(checksum) == 64 # SHA-256

    read_back = StorageService.read_bytes(rel_path)
    assert read_back == data

def test_studio_generate_3d_per_size_assets():
    """Verify studio generate-3d generates separate distinct GLB assets for multiple sizes."""
    req = GarmentGenerationRequest(
        product_id="test_studio_shirt",
        sku="SKU-STUDIO-SHIRT-01",
        name="Áo Sơ Mi Oxford Công Sở",
        category="shirt",
        description="Áo sơ mi dáng classic fit.",
        material="100% Cotton Oxford",
        stretch_pct=4.0,
        thickness_mm=1.4,
        primary_color_hex="#1E3A8A",
        sizes={
            "S": {"chest_width_cm": 48.0, "body_length_cm": 67.0, "shoulder_width_cm": 43.0, "sleeve_length_cm": 57.0, "hem_width_cm": 47.0, "neck_circ_cm": 39.0},
            "M": {"chest_width_cm": 51.0, "body_length_cm": 70.0, "shoulder_width_cm": 45.0, "sleeve_length_cm": 59.0, "hem_width_cm": 50.0, "neck_circ_cm": 40.5},
            "L": {"chest_width_cm": 54.0, "body_length_cm": 73.0, "shoulder_width_cm": 47.0, "sleeve_length_cm": 61.0, "hem_width_cm": 53.0, "neck_circ_cm": 42.0}
        },
        drape_mode="pushout"
    )

    res = generate_garment_3d(req)
    assert res.status == "ready_for_review"
    assert len(res.completed_sizes) == 3
    assert "S" in res.completed_sizes
    assert "M" in res.completed_sizes
    assert "L" in res.completed_sizes

    # Check distinct assets per size
    prod = res.product
    assert prod is not None
    assert len(prod.variants) == 3

    for v in prod.variants:
        assert v.generation_status == "ready"
        assert len(v.assets) >= 1
        glb_asset = v.assets[0]
        assert glb_asset.asset_type == "glb_skinned"
        assert f"sizes/{v.size}/garment-v1.glb" in glb_asset.storage_path
        # Verify physical file exists in durable storage
        full_glb = os.path.join(StorageService.get_durable_dir(), *glb_asset.storage_path.split("/"))
        assert os.path.exists(full_glb)
        assert os.path.getsize(full_glb) > 1024

def test_publish_and_catalog_persistence():
    """Verify publishing product makes it available in persistent catalog and survives re-queries."""
    pid = "test_studio_shirt"
    pub_res = publish_garment_product(PublishProductRequest(product_id=pid))
    assert pub_res.status == "published"

    # Query catalog
    published = CatalogRepository.get_all(published_only=True)
    found = [p for p in published if p["product_id"] == pid]
    assert len(found) == 1
    assert found[0]["name"] == "Áo Sơ Mi Oxford Công Sở"
    assert len(found[0]["variants"]) == 3

    # Clean up test product
    CatalogRepository.delete(pid)
