from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class GarmentAssetSchema(BaseModel):
    asset_id: str = Field(..., description="Unique asset identifier")
    product_id: str = Field(..., description="Parent product identifier")
    variant_id: Optional[str] = Field(None, description="Associated size variant identifier")
    size: Optional[str] = Field(None, description="Size code: XS, S, M, L, XL, XXL")
    asset_type: str = Field(..., description="Asset type: source_front, source_back, mask, texture, glb_skinned, preview_thumbnail")
    asset_version: int = Field(1, description="Asset version number")
    storage_path: str = Field(..., description="Durable storage relative path")
    public_url: str = Field(..., description="Browser accessible public URL")
    checksum: str = Field("", description="SHA-256 file checksum")
    generation_mode: str = Field("pushout", description="Generation pipeline: pushout or blender")
    rigging_compatibility: str = Field("SMPL_24_JOINT_RIG", description="Armature rig compatibility standard")
    validation_status: str = Field("passed", description="Validation status: passed, warning, failed")
    created_at: str = Field("", description="ISO timestamp")

class GarmentVariantSchema(BaseModel):
    variant_id: str = Field(..., description="Unique variant identifier")
    product_id: str = Field(..., description="Parent product identifier")
    size: str = Field(..., description="Size code: XS, S, M, L, XL, XXL")
    measurements: Dict[str, float] = Field(..., description="Flat garment measurements in cm")
    stretch_pct: float = Field(..., description="Fabric stretch percentage")
    thickness_mm: float = Field(..., description="Fabric thickness in mm")
    generation_status: str = Field("ready", description="Generation status: pending, processing, ready, failed")
    assets: List[GarmentAssetSchema] = Field(default_factory=list, description="Variant-specific assets (GLB, thumbnail)")
    fitting_diagnostics: Optional[Dict[str, Any]] = Field(None, description="Zero-penetration & mesh measurement accuracy diagnostics")

class GarmentProductSchema(BaseModel):
    product_id: str = Field(..., description="Unique product ID")
    sku: str = Field(..., description="SKU or product code")
    name: str = Field(..., description="Product display name")
    category: str = Field(..., description="Category: tshirt, shirt, cardigan, jacket")
    description: str = Field("", description="Product description")
    status: str = Field("draft", description="Status: draft, processing, ready_for_review, published, failed")
    material: str = Field("Cotton", description="Fabric material description")
    stretch_pct: float = Field(15.0, description="Stretch percentage")
    thickness_mm: float = Field(1.5, description="Thickness in mm")
    primary_color_hex: str = Field("#19284B", description="Primary dominant color hex")
    pattern_description: Optional[str] = Field(None, description="Pattern or print description")
    design_notes: Optional[str] = Field(None, description="Internal design and fabrication notes")
    image_front_url: str = Field("", description="Front image public URL")
    image_back_url: Optional[str] = Field(None, description="Optional back image public URL")
    created_at: str = Field("", description="Creation ISO timestamp")
    updated_at: str = Field("", description="Update ISO timestamp")
    variants: List[GarmentVariantSchema] = Field(default_factory=list, description="List of per-size variants")
    assets: List[GarmentAssetSchema] = Field(default_factory=list, description="All product assets")

class ImageAnalysisResponse(BaseModel):
    dominant_hex: str
    dominant_rgb: List[int]
    photo_aspect: float
    aspect_warning: Optional[Dict[str, Any]] = None
    category_detected: str
    mask_url: str
    texture_url: str
    warning_notes: Optional[str] = None

class GarmentGenerationRequest(BaseModel):
    product_id: Optional[str] = None
    sku: str
    name: str
    category: str
    description: str = ""
    material: str = "Cotton"
    stretch_pct: float = 15.0
    thickness_mm: float = 1.5
    primary_color_hex: str = "#19284B"
    pattern_description: Optional[str] = None
    design_notes: Optional[str] = None
    sizes: Dict[str, Dict[str, float]] # e.g. {"S": {...}, "M": {...}, "L": {...}}
    drape_mode: str = "pushout"
    gender_reference: str = "neutral"

class GarmentGenerationProgress(BaseModel):
    product_id: str
    status: str # 'processing' | 'ready_for_review' | 'failed'
    progress_pct: int
    current_size: Optional[str] = None
    completed_sizes: List[str] = []
    failed_sizes: List[str] = []
    errors: List[str] = []
    warnings: List[str] = []
    product: Optional[GarmentProductSchema] = None

class PublishProductRequest(BaseModel):
    product_id: str
