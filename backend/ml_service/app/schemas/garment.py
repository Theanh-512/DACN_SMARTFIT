from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class SizeSpec(BaseModel):
    chest_width_cm: float = Field(..., description="Ngang ngực đặt phẳng (cm)")
    body_length_cm: float = Field(..., description="Dài thân từ đỉnh vai xuống gấu (cm)")
    shoulder_width_cm: float = Field(..., description="Rộng vai (cm)")
    sleeve_length_cm: float = Field(..., description="Dài tay (cm)")
    hem_width_cm: float = Field(..., description="Ngang gấu áo (cm)")
    neck_circ_cm: float = Field(..., description="Chu vi vòng cổ áo (cm)")

class FabricSpec(BaseModel):
    material: str = Field(..., description="Tên chất liệu vải")
    stretch_pct: float = Field(default=5.0, description="Độ co giãn %")
    thickness_mm: float = Field(default=1.5, description="Độ dày vải (mm)")
    weight_gsm: float = Field(default=220.0, description="Định lượng vải (g/m2)")

class Product3D(BaseModel):
    product_id: str
    name: str
    category: str
    description: Optional[str] = None
    image_front: str
    color_hex: Optional[str] = "#19284B"
    fabric: FabricSpec
    note: Optional[str] = None
    sizes: Dict[str, SizeSpec]

class GarmentDrapeRequest(BaseModel):
    product_id: str = Field(default="prod_tshirt_cotton")
    size: str = Field(default="M")
    gender: str = Field(default="neutral")
    height_cm: float = Field(default=174.5)
    betas: List[float] = Field(default_factory=lambda: [0.0] * 10)
    color_hex: Optional[str] = None
    drape_mode: Optional[str] = "pushout"

class GarmentDrapeResponse(BaseModel):
    product_id: str
    product_name: str
    category: str
    size: str
    glb_url: str
    drape_mode: str
    mesh_measurements: Dict[str, float]
    target_specs: Dict[str, float]
    ease_info: Dict[str, Any]
    status: str = "success"
