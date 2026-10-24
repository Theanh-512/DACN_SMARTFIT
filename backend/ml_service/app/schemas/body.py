from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class BodyMeasureRequest(BaseModel):
    betas: List[float] = Field(
        default_factory=lambda: [0.0] * 10,
        description="10 SMPL-X PCA shape parameters (betas)",
        examples=[[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]]
    )
    pose: Optional[str] = Field("T-pose", description="Pose type: 'T-pose' or 'A-pose'")

class BodyMeasureResponse(BaseModel):
    height_cm: float = Field(..., description="Stature / Total body height (cm)")
    chest_cm: float = Field(..., description="Chest / Bust circumference (cm)")
    waist_cm: float = Field(..., description="Waist / Abdominal circumference (cm)")
    hip_cm: float = Field(..., description="Hip circumference (gluteal prominence) (cm)")
    shoulder_cm: float = Field(..., description="Across shoulder breadth (cm)")
    arm_length_cm: float = Field(..., description="Arm length from shoulder to wrist (cm)")
    torso_length_cm: float = Field(..., description="Torso length from cervicale to crotch (cm)")
    is_mock: bool = Field(..., description="True if running in mock mode, False if official SMPL-X model")
    status: str = Field("success", description="Response status")

class BodyEstimateResponse(BaseModel):
    betas: List[float] = Field(..., description="10 estimated SMPL-X PCA shape parameters (betas)")
    measurements: Dict[str, float] = Field(..., description="Extracted ISO 8559 apparel body measurements in cm")
    height_cm: float = Field(..., description="Normalized stature (cm)")
    weight_kg: Optional[float] = Field(None, description="User body weight in kg (if supplied)")
    has_side_image: bool = Field(False, description="True if side image was supplied and fused")
    is_mock: bool = Field(..., description="True if running in mock estimation mode")
    privacy_cleaned: bool = Field(True, description="True indicating user uploaded images have been permanently deleted")
    processing_time_ms: float = Field(..., description="Inference and processing latency in milliseconds")
    status: str = Field("success", description="Response status")

class TryOnGarmentRequest(BaseModel):
    betas: Optional[List[float]] = Field(default_factory=lambda: [0.0] * 10, description="10 SMPL-X shape betas")
    height_cm: Optional[float] = Field(175.0, description="Target height in cm")
    size: str = Field("M", description="Garment size: S, M, L, XL")
    color_hex: Optional[str] = Field("#19284B", description="Fabric color in hex format")
    drape_mode: Optional[str] = Field("pushout", description="Drape collision mode: 'pushout'")

class TryOnGarmentResponse(BaseModel):
    size: str = Field(..., description="Chosen garment size")
    ease_info: Dict[str, Any] = Field(..., description="Ease and fit diagnostic information")
    glb_url: str = Field(..., description="URL or relative path to fitted garment GLB model")
    status: str = Field("success", description="Status string")

