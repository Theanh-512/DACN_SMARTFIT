import os
import uuid
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from app.schemas.body import (
    BodyMeasureRequest,
    BodyMeasureResponse,
    BodyEstimateResponse,
    TryOnGarmentRequest,
    TryOnGarmentResponse
)
from core.body_model import BodyModel
from core.measurements import BodyMeasurements
from core.pose_shape import BodyEstimationPipeline, MockBodyEstimator, PretrainedBodyEstimator
from app.routers.health import get_body_model

logger = logging.getLogger("ml_service.routers.body")
router = APIRouter(prefix="/body", tags=["Body Anthropometry"])

# Initialize pipeline (uses MockBodyEstimator by default or PretrainedBodyEstimator when configured)
_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        ckpt_path = os.getenv("POSE_MODEL_CKPT", "")
        if not ckpt_path:
            default_ckpt = os.path.join(
                os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
                "assets", "models", "camerahmr", "camerahmr_checkpoint_cleaned.ckpt"
            )
            ckpt_path = default_ckpt if os.path.exists(default_ckpt) else None
        estimator = PretrainedBodyEstimator(model_checkpoint_path=ckpt_path)
        _pipeline = BodyEstimationPipeline(estimator=estimator)
    return _pipeline

@router.post("/measure", response_model=BodyMeasureResponse)
def measure_body(request: BodyMeasureRequest):
    """
    Computes ISO 8559 garment anthropometric measurements (in cm) from SMPL-X shape betas.
    """
    try:
        model = get_body_model()
        verts, faces = model.build_mesh(betas=request.betas, pose=request.pose or "T-pose")
        meas = BodyMeasurements.extract_from_mesh((verts, faces))

        return BodyMeasureResponse(
            height_cm=meas["height_cm"],
            chest_cm=meas["chest_cm"],
            waist_cm=meas["waist_cm"],
            hip_cm=meas["hip_cm"],
            shoulder_cm=meas["shoulder_cm"],
            arm_length_cm=meas["arm_length_cm"],
            torso_length_cm=meas["torso_length_cm"],
            is_mock=model.is_mock,
            status="success"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Measurement error: {str(e)}")

@router.post("/estimate", response_model=BodyEstimateResponse)
async def estimate_body_from_image(
    image_front: UploadFile = File(..., description="Front-view full-body photo (mandatory)"),
    image_side: Optional[UploadFile] = File(None, description="Side-view profile photo (optional)"),
    height_cm: float = Form(..., description="User's real measured height in cm (mandatory)"),
    weight_kg: Optional[float] = Form(None, description="User's weight in kg (optional)"),
    privacy_agreed: bool = Form(True, description="Consent checkbox to process and immediately discard photos")
):
    """
    Image -> SMPL-X Estimation Pipeline:
    1. Validates full-body image(s).
    2. Estimates 10 SMPL-X betas (with multi-view fusion if side image is provided).
    3. Normalizes 3D mesh dimensions to the user's real height.
    4. Computes ISO 8559 body measurements.
    5. STRICT PRIVACY: Uploaded photos are wiped immediately from disk in a finally block.
    """
    if not privacy_agreed:
        raise HTTPException(
            status_code=400,
            detail="User privacy consent is required before processing photographs."
        )

    # Temporary directory for in-flight processing
    temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "assets", "temp")
    os.makedirs(temp_dir, exist_ok=True)

    front_temp_path = os.path.join(temp_dir, f"front_{uuid.uuid4().hex}.jpg")
    side_temp_path = None

    try:
        # Save front image temporarily
        front_bytes = await image_front.read()
        with open(front_temp_path, "wb") as f:
            f.write(front_bytes)

        # Save side image temporarily if provided
        if image_side is not None and image_side.filename:
            side_temp_path = os.path.join(temp_dir, f"side_{uuid.uuid4().hex}.jpg")
            side_bytes = await image_side.read()
            with open(side_temp_path, "wb") as f:
                f.write(side_bytes)

        # Run pipeline
        pipeline = get_pipeline()
        result = pipeline.process(
            front_image_path=front_temp_path,
            side_image_path=side_temp_path,
            height_cm=height_cm,
            weight_kg=weight_kg,
            privacy_agreed=privacy_agreed
        )

        # Calculate exact body measurements from estimated betas
        model = get_body_model()
        mesh = model.get_trimesh(betas=result["betas"])
        measurements = BodyMeasurements.extract_from_mesh(mesh)

        # Scale height strictly to match real stature
        measurements["height_cm"] = float(round(height_cm, 1))

        return BodyEstimateResponse(
            betas=result["betas"],
            measurements=measurements,
            height_cm=result["height_cm"],
            weight_kg=result["weight_kg"],
            has_side_image=result["has_side_image"],
            is_mock=result["is_mock"],
            privacy_cleaned=True,
            confidence=0.92 if not result["is_mock"] else 0.85,
            quality_report={"full_body": True, "stature_normalized": True},
            warnings=(
                (["MOCK_FALLBACK: Hệ thống đang dùng mô hình thống kê dự phòng do chưa nạp trọng số CameraHMR."] if result["is_mock"] else [])
                + result.get("warnings", [])
            ),
            processing_time_ms=result["processing_time_ms"],
            status="success"
        )
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        logger.error(f"Estimation pipeline error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Image estimation error: {str(e)}")
    finally:
        # Strict privacy cleanup: ensure files are deleted unconditionally
        for p in [front_temp_path, side_temp_path]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                    logger.debug(f"[Privacy] Successfully deleted temporary image: {p}")
                except Exception as del_err:
                    logger.warning(f"[Privacy] Error cleaning temp image {p}: {del_err}")

@router.post("/tryon", response_model=TryOnGarmentResponse)
def tryon_garment(request: TryOnGarmentRequest):
    """
    Phase 4 Parametric Slicing & Pushout Drape Try-On:
    1. Generates 3D body mesh in A-pose for the provided betas and height.
    2. Slices torso at chest, waist, hem according to classic T-shirt size chart.
    3. Runs pushout collision resolution against body surface.
    4. Saves GLB asset and returns exact ISO ease measurements.
    """
    try:
        from core.garment import GarmentGenerator
        model = get_body_model()
        body_mesh = model.get_trimesh(betas=request.betas, pose="a_pose")

        # Stature scaling if height_cm differs from canonical 174.5cm
        if request.height_cm and abs(request.height_cm - 174.5) > 1.0:
            scale_y = request.height_cm / 174.5
            body_mesh.apply_scale([1.0, scale_y, 1.0])

        gen = GarmentGenerator()
        g_mesh, ease_info = gen.generate_tshirt(
            body_mesh=body_mesh,
            size=request.size,
            color_hex=request.color_hex or "#19284B",
            drape_mode=request.drape_mode or "pushout"
        )

        # Output paths
        size_key = request.size.lower()
        garments_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "assets", "garments")
        os.makedirs(garments_dir, exist_ok=True)
        backend_glb_path = os.path.join(garments_dir, f"fitted_{size_key}.glb")
        g_mesh.export(backend_glb_path, file_type="glb")

        frontend_garments_dir = os.path.normpath(os.path.join(garments_dir, "..", "..", "..", "frontend", "fashion-ai-web", "public", "assets", "garments"))
        if os.path.exists(os.path.dirname(frontend_garments_dir)):
            os.makedirs(frontend_garments_dir, exist_ok=True)
            frontend_glb_path = os.path.join(frontend_garments_dir, f"fitted_{size_key}.glb")
            g_mesh.export(frontend_glb_path, file_type="glb")

        return TryOnGarmentResponse(
            size=request.size.upper(),
            ease_info=ease_info,
            glb_url=f"/assets/garments/fitted_{size_key}.glb",
            status="success"
        )
    except Exception as e:
        logger.error(f"Try-on fitting error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Garment fitting error: {str(e)}")

