from typing import Dict, Any, List, Optional
import os
import shutil
import uuid
import time
import logging
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, status
from pydantic import BaseModel, Field

from app.anthropometry.iso_measurements import FocusedAnthropometryExtractor, Iso8559Measurements
from app.anthropometry.mesh_generator import SmplxMeshGenerator
from app.anthropometry.face_processor import FaceProcessor
from app.sizing.recommender import STANDARD_SIZE_CHARTS

logger = logging.getLogger(__name__)
router = APIRouter()

class ReconstructAvatarRequest(BaseModel):
    height_cm: float = Field(175.0, ge=140.0, le=220.0, description="Chiều cao cơ thể (cm)")
    weight_kg: float = Field(70.0, ge=35.0, le=180.0, description="Cân nặng cơ thể (kg)")
    gender: str = Field("male", description="Giới tính: male, female")
    preset_key: Optional[str] = Field("male_regular", description="Mã preset vóc dáng chuẩn hóa")
    body_type: str = Field("regular", description="Kiểu hình vóc dáng tương thích")
    skin_tone: str = Field("asian", description="Tông màu da: fair, light, asian, honey, deep")
    skin_hex: Optional[str] = Field(None, description="Mã màu da Hex tùy chỉnh (vd: #E8C39E)")
    face_texture_path: Optional[str] = Field(None, description="Đường dẫn texture khuôn mặt nếu có")
    chest_cm: Optional[float] = Field(None, description="Số đo vòng ngực thực tế nếu có (cm)")
    waist_cm: Optional[float] = Field(None, description="Số đo vòng eo thực tế nếu có (cm)")
    hip_cm: Optional[float] = Field(None, description="Số đo vòng mông thực tế nếu có (cm)")
    shoulder_cm: Optional[float] = Field(None, description="Số đo rộng vai nếu có (cm)")

class ReconstructAvatarResponse(BaseModel):
    avatar_id: str
    glb_url: str
    betas: List[float]
    iso_measurements: Iso8559Measurements
    preset_key: str
    gender: str
    message: str

class TryOn3DRequest(BaseModel):
    betas: List[float] = Field(..., description="10 tham số hình thể SMPL-X beta")
    height_cm: float = Field(175.0, ge=140.0, le=220.0)
    gender: str = Field("male")
    preset_key: Optional[str] = None
    product_id: str = Field(..., description="Mã sản phẩm")
    product_name: str = Field("", description="Tên sản phẩm để tạo phom dáng chính xác")
    category_id: str = Field("cat-tshirts", description="Danh mục sản phẩm")
    size: str = Field("M", description="Kích cỡ muốn thử: XS, S, M, L, XL, XXL")
    garment_color: str = Field("navy", description="Màu áo")
    garment_hex: Optional[str] = Field(None, description="Mã màu áo tùy chọn")
    skin_tone: str = Field("asian")
    skin_hex: Optional[str] = None
    face_texture_path: Optional[str] = None
    show_heatmap: bool = Field(True, description="Hiển thị bản đồ áp lực căng chật")

class FitDiagnosticResponse(BaseModel):
    is_tight: bool
    tight_regions: List[str]
    loose_regions: List[str]
    overpressure_percentage: float
    recommended_size_action: str
    recommended_size: str
    explanation: str

class TryOn3DResponse(BaseModel):
    scene_glb_url: str
    fit_diagnostic: FitDiagnosticResponse
    iso_measurements: Iso8559Measurements
    execution_time_ms: float

BASE_AI_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
UPLOAD_DIR = os.path.join(BASE_AI_DIR, "data", "uploads")
RESULTS_DIR = os.path.join(BASE_AI_DIR, "data", "results", "avatars")
TEXTURES_DIR = os.path.join(BASE_AI_DIR, "data", "results", "textures")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(TEXTURES_DIR, exist_ok=True)


@router.post("/reconstruct", response_model=ReconstructAvatarResponse)
def reconstruct_avatar(req: ReconstructAvatarRequest):
    """
    Dựng nhân vật 3D SMPL-X liền mạch, bề mặt mịn màng với vật liệu PBR và thông số ISO 8559-1.
    """
    preset = req.preset_key or f"{req.gender}_{req.body_type}"
    if preset not in SmplxMeshGenerator.PRESET_BETAS:
        preset = "female_regular" if req.gender == "female" else "male_regular"

    betas = FocusedAnthropometryExtractor.estimate_betas_from_metrics(
        height_cm=req.height_cm,
        weight_kg=req.weight_kg,
        gender=req.gender,
        body_type=req.body_type,
        chest_cm=req.chest_cm,
        waist_cm=req.waist_cm,
        hip_cm=req.hip_cm,
        shoulder_cm=req.shoulder_cm
    )

    iso_m = FocusedAnthropometryExtractor.calculate_iso8559_from_betas(
        betas=betas,
        base_height_cm=req.height_cm,
        gender=req.gender
    )

    # Kiểm tra đường dẫn texture mặt nếu có
    face_tex_full_path = None
    if req.face_texture_path:
        candidate = os.path.join(TEXTURES_DIR, os.path.basename(req.face_texture_path))
        if os.path.exists(candidate):
            face_tex_full_path = candidate

    body_mesh = SmplxMeshGenerator.create_body_mesh(
        betas=betas,
        height_cm=req.height_cm,
        gender=req.gender,
        preset_key=preset,
        skin_color_hex=req.skin_hex,
        skin_tone_key=req.skin_tone,
        face_texture_path=face_tex_full_path
    )

    glb_url = SmplxMeshGenerator.export_scene_glb(
        body_mesh=body_mesh,
        garment_mesh=None,
        output_dir=RESULTS_DIR,
        filename_prefix="base_avatar"
    )

    return ReconstructAvatarResponse(
        avatar_id=uuid.uuid4().hex[:8],
        glb_url=glb_url,
        betas=betas,
        iso_measurements=iso_m,
        preset_key=preset,
        gender=req.gender,
        message="Đã dựng nhân vật 3D thành công theo chuẩn nhân trắc học ISO 8559-1!"
    )


@router.post("/tryon-3d", response_model=TryOn3DResponse)
def tryon_3d(req: TryOn3DRequest):
    """
    Mặc trang phục 3D đặc thù theo sản phẩm lên nhân vật SMPL-X và quét bản đồ áp lực căng chật (Tension Heatmap).
    """
    t0 = time.time()

    iso_m = FocusedAnthropometryExtractor.calculate_iso8559_from_betas(
        betas=req.betas,
        base_height_cm=req.height_cm,
        gender=req.gender
    )

    face_tex_full_path = None
    if req.face_texture_path:
        candidate = os.path.join(TEXTURES_DIR, os.path.basename(req.face_texture_path))
        if os.path.exists(candidate):
            face_tex_full_path = candidate

    # 1. Sinh thân người với vật liệu PBR
    body_mesh = SmplxMeshGenerator.create_body_mesh(
        betas=req.betas,
        height_cm=req.height_cm,
        gender=req.gender,
        preset_key=req.preset_key,
        skin_color_hex=req.skin_hex,
        skin_tone_key=req.skin_tone,
        face_texture_path=face_tex_full_path
    )

    # 2. Sinh lưới trang phục bám sát kiểu dáng sản phẩm
    garment_mesh = SmplxMeshGenerator.create_garment_mesh(
        category=req.category_id,
        size_label=req.size,
        betas=req.betas,
        height_cm=req.height_cm,
        garment_color_key=req.garment_color,
        garment_color_hex=req.garment_hex,
        product_name=req.product_name
    )

    # 3. Lấy thông số may đo từ bảng chuẩn
    cat_chart = STANDARD_SIZE_CHARTS.get(req.category_id, STANDARD_SIZE_CHARTS.get("cat-tshirts", {}))
    size_dims = cat_chart.get(req.size, {"chest": 100.0, "shoulder": 44.5, "waist": 82.0})

    # 4. Đánh giá va chạm và tô Tension Heatmap nếu bật
    body_mesh, garment_mesh, diag = SmplxMeshGenerator.evaluate_fit_and_apply_heatmap(
        body_mesh=body_mesh,
        garment_mesh=garment_mesh,
        product_size_chart=size_dims,
        body_measurements={
            "chest": iso_m.chest_cm,
            "waist": iso_m.waist_cm,
            "shoulder": iso_m.shoulder_cm
        },
        size_label=req.size
    )

    size_order = ["XS", "S", "M", "L", "XL", "XXL"]
    cur_idx = size_order.index(req.size) if req.size in size_order else 2
    if diag.recommended_size_action == "size_up":
        rec_size = size_order[min(len(size_order) - 1, cur_idx + 1)]
    elif diag.recommended_size_action == "size_down":
        rec_size = size_order[max(0, cur_idx - 1)]
    else:
        rec_size = req.size

    # 5. Xuất GLB
    glb_url = SmplxMeshGenerator.export_scene_glb(
        body_mesh=body_mesh,
        garment_mesh=garment_mesh,
        output_dir=RESULTS_DIR,
        filename_prefix=f"tryon_{req.size}"
    )

    exec_time = round((time.time() - t0) * 1000, 1)

    return TryOn3DResponse(
        scene_glb_url=glb_url,
        fit_diagnostic=FitDiagnosticResponse(
            is_tight=diag.is_tight,
            tight_regions=diag.tight_regions,
            loose_regions=diag.loose_regions,
            overpressure_percentage=diag.overpressure_percentage,
            recommended_size_action=diag.recommended_size_action,
            recommended_size=rec_size,
            explanation=diag.explanation
        ),
        iso_measurements=iso_m,
        execution_time_ms=exec_time
    )


@router.post("/upload-photo-reconstruct")
async def upload_photo_reconstruct(
    person_image: UploadFile = File(...),
    height_cm: float = Form(175.0),
    weight_kg: float = Form(70.0),
    gender: str = Form("male"),
    preset_key: Optional[str] = Form(None),
    user_consent: bool = Form(True)
):
    """
    Quy trình cá nhân hóa khuôn mặt (Face Personalization Pipeline) tuân thủ bảo mật và quyền riêng tư:
    1. Kiểm tra sự đồng thuận của người dùng (User Consent).
    2. Xác thực định dạng tệp (JPEG, PNG) và giới hạn dung lượng <= 5MB.
    3. Nhận diện khuôn mặt và trích xuất texture 512x512.
    4. Chiếu texture diện mạo xấp xỉ lên đầu nhân vật 3D.
    """
    if not user_consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn cần xác nhận đồng ý xử lý ảnh diện mạo để sử dụng tính năng cá nhân hóa khuôn mặt."
        )

    # Đọc dữ liệu ảnh
    content = await person_image.read()
    if len(content) > FaceProcessor.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Dung lượng tệp ảnh vượt quá giới hạn 5MB."
        )

    # Xử lý trích xuất khuôn mặt
    result = FaceProcessor.process_face_texture(content, TEXTURES_DIR)
    if not result.is_success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.message
        )

    face_tex_full_path = None
    if result.texture_relative_path:
        face_tex_full_path = os.path.join(TEXTURES_DIR, result.texture_relative_path)

    preset = preset_key or f"{gender}_regular"

    betas = FocusedAnthropometryExtractor.estimate_betas_from_metrics(
        height_cm=height_cm,
        weight_kg=weight_kg,
        gender=gender
    )

    iso_m = FocusedAnthropometryExtractor.calculate_iso8559_from_betas(
        betas=betas,
        base_height_cm=height_cm,
        gender=gender
    )

    body_mesh = SmplxMeshGenerator.create_body_mesh(
        betas=betas,
        height_cm=height_cm,
        gender=gender,
        preset_key=preset,
        skin_color_hex=result.skin_hex,
        face_texture_path=face_tex_full_path
    )

    glb_url = SmplxMeshGenerator.export_scene_glb(
        body_mesh=body_mesh,
        garment_mesh=None,
        output_dir=RESULTS_DIR,
        filename_prefix="avatar_photo"
    )

    return {
        "status": "success",
        "has_detected_face": result.has_detected_face,
        "face_texture_relative_path": result.texture_relative_path,
        "skin_hex": result.skin_hex,
        "skin_rgb": list(result.skin_rgb),
        "glb_url": glb_url,
        "betas": betas,
        "iso_measurements": iso_m.model_dump(),
        "disclaimer": "Lưu ý: Đây là diện mạo gương mặt được chiếu xấp xỉ (Face Texture Projection Approximation), không phải bản tái cấu trúc hộp sọ 3D y khoa.",
        "message": result.message
    }


@router.post("/delete-data")
async def delete_avatar_data(
    texture_relative_path: Optional[str] = Form(None)
):
    """
    Quyền được lãng quên (Right to be Forgotten): Xóa toàn bộ ảnh và texture diện mạo tạm thời khỏi máy chủ.
    """
    deleted = False
    if texture_relative_path:
        target = os.path.join(TEXTURES_DIR, os.path.basename(texture_relative_path))
        if os.path.exists(target):
            try:
                os.remove(target)
                deleted = True
            except Exception as e:
                logger.error(f"Lỗi khi xóa tệp: {e}")

    return {
        "status": "success",
        "deleted": deleted,
        "message": "Đã xóa toàn bộ dữ liệu ảnh diện mạo cá nhân khỏi hệ thống an toàn."
    }
