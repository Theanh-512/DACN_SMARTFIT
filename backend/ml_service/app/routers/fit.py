"""
Phase 5: Fit Advisor Router
============================
Endpoints:
  POST /fit/evaluate          - Đánh giá độ vừa từ betas + garment GLB path
  POST /fit/evaluate-meshes   - Đánh giá từ betas + product_id + size (dùng cached GLB)
  GET  /fit/heatmap/{task_id} - Lấy dữ liệu heatmap khoảng cách đã tính
"""

import os
import json
import uuid
import logging
from typing import Optional, List
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.fit_advisor import FitAdvisor, GarmentMeshMeasurements, FitHeatmap, evaluate_fit_from_glb_paths
from core.body_model import BodyModel
from core.measurements import BodyMeasurements
from core.storage_service import StorageService

logger = logging.getLogger("ml_service.routers.fit")
router = APIRouter(prefix="/fit", tags=["Phase 5: Fit Advisor"])

# ============================================================
# Schemas
# ============================================================

class FitEvaluateRequest(BaseModel):
    """Đánh giá độ vừa từ betas + garment_glb_path"""
    betas: List[float] = Field(default=[0.0] * 10, description="10 SMPL shape parameters")
    height_cm: float = Field(default=175.0, ge=120.0, le=230.0)
    gender: str = Field(default="neutral", description="neutral | male | female")
    garment_type: str = Field(default="tshirt", description="tshirt | cardigan | ...")
    current_size: str = Field(default="M", description="Size đang mặc: XS S M L XL XXL")
    available_sizes: Optional[List[str]] = Field(default=None)
    size_chart: Optional[dict] = Field(default=None, description="Bảng size thô từ product spec")

    # Garment source (một trong hai cách):
    garment_glb_path: Optional[str] = Field(
        default=None,
        description="Đường dẫn tương đối đến garment GLB (từ assets durable dir)"
    )
    product_id: Optional[str] = Field(
        default=None,
        description="product_id từ catalog để tự tìm GLB theo size"
    )

class FitRegionResult(BaseModel):
    ease_cm: Optional[float] = None
    fit: str
    label: str
    target_min: Optional[float] = None
    target_comfortable: Optional[float] = None

class GarmentMeasurementsResult(BaseModel):
    chest_cm: float
    waist_cm: float
    hip_cm: float
    body_length_cm: float
    sleeve_length_cm: float

class HeatmapRegionStat(BaseModel):
    mean_mm: float
    max_mm: float
    min_mm: float
    pct_tight: float
    n_verts: int

class FitEvaluateResponse(BaseModel):
    request_id: str
    garment_measurements: GarmentMeasurementsResult
    ease_by_region: dict
    overall_fit: str
    overall_fit_label: str
    recommended_size: str
    size_action: str
    confidence: float
    heatmap_summary: dict
    explanation: str
    # distances_mm omitted in main response (use /heatmap/{id} endpoint)
    heatmap_task_id: str

class HeatmapResponse(BaseModel):
    task_id: str
    distances_mm: List[float]
    heatmap_summary: dict
    garment_vert_count: int


# ============================================================
# In-memory heatmap cache (task_id -> distances_mm + summary)
# ============================================================
_heatmap_cache: dict = {}

# ============================================================
# Helpers
# ============================================================

def _resolve_garment_glb(req: FitEvaluateRequest) -> str:
    """Xác định đường dẫn GLB từ request."""
    durable_dir = StorageService.get_durable_dir()

    # Cách 1: đường dẫn trực tiếp
    if req.garment_glb_path:
        full = os.path.join(durable_dir, req.garment_glb_path.lstrip("/\\"))
        if os.path.exists(full):
            return full
        # Thử coi là đường dẫn tuyệt đối
        if os.path.exists(req.garment_glb_path):
            return req.garment_glb_path

    # Cách 2: product_id + size từ catalog cache
    if req.product_id:
        sz_upper = req.current_size.upper()
        # Thử catalog storage path: garments/{product_id}/sizes/{size}/garment-v1.glb
        rel = f"garments/{req.product_id}/sizes/{sz_upper}/garment-v1.glb"
        full = os.path.join(durable_dir, *rel.split("/"))
        if os.path.exists(full):
            return full

        # Legacy path: garments/{product_id}_{size}.glb
        sz_lower = sz_upper.lower()
        rel2 = f"garments/{req.product_id}_{sz_lower}.glb"
        full2 = os.path.join(durable_dir, *rel2.split("/"))
        if os.path.exists(full2):
            return full2

        # Frontend public dir
        fe_dir = os.path.normpath(os.path.join(
            durable_dir, "..", "..", "..", "frontend", "fashion-ai-web", "public", "assets"
        ))
        fe_path = os.path.join(fe_dir, "garments", f"{req.product_id}_{sz_lower}.glb")
        if os.path.exists(fe_path):
            return fe_path

    raise FileNotFoundError(
        f"Không tìm thấy GLB cho product_id={req.product_id}, size={req.current_size}. "
        "Hãy generate garment trước qua /garment/studio/generate-3d."
    )


# ============================================================
# Endpoints
# ============================================================

@router.post("/evaluate", response_model=FitEvaluateResponse)
def evaluate_fit(req: FitEvaluateRequest):
    """
    **Phase 5 – Đánh giá độ vừa chính thức.**

    Tính:
    - Số đo đo trực tiếp trên mesh áo (không dùng bảng size)
    - Ease (cm) theo từng vùng: ngực, eo, hông
    - Heatmap khoảng cách từ đỉnh áo tới thân
    - Gợi ý size lên/xuống với giải thích

    Yêu cầu: garment GLB đã được tạo trước qua `/garment/studio/generate-3d`.
    """
    try:
        glb_path = _resolve_garment_glb(req)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Lỗi xác định GLB: {e}")

    try:
        import trimesh
        # Build body
        model = BodyModel(gender=req.gender)
        body_mesh = model.get_trimesh(betas=req.betas, pose="a_pose")
        if req.height_cm and abs(req.height_cm - 174.5) > 1.0:
            body_mesh.apply_scale([1.0, req.height_cm / 174.5, 1.0])
        body_measurements = BodyMeasurements.extract_from_mesh(body_mesh)

        # Load garment
        raw = trimesh.load(glb_path, force="mesh")
        if isinstance(raw, trimesh.Scene):
            geoms = list(raw.geometry.values())
            garment_mesh = trimesh.util.concatenate(geoms) if geoms else trimesh.Trimesh()
        else:
            garment_mesh = raw

        if len(garment_mesh.vertices) < 100:
            raise ValueError("Mesh áo rỗng hoặc quá nhỏ.")

        result = FitAdvisor.evaluate(
            garment_mesh=garment_mesh,
            body_mesh=body_mesh,
            body_measurements=body_measurements,
            garment_type=req.garment_type,
            current_size=req.current_size,
            available_sizes=req.available_sizes,
            size_chart=req.size_chart,
        )

        # Lưu distances_mm vào cache
        task_id = f"hm_{uuid.uuid4().hex[:12]}"
        _heatmap_cache[task_id] = {
            "distances_mm": result["distances_mm"],
            "heatmap_summary": result["heatmap_summary"],
            "garment_vert_count": len(garment_mesh.vertices),
        }

        return FitEvaluateResponse(
            request_id=str(uuid.uuid4()),
            garment_measurements=GarmentMeasurementsResult(**result["garment_measurements"]),
            ease_by_region=result["ease_by_region"],
            overall_fit=result["overall_fit"],
            overall_fit_label=result["overall_fit_label"],
            recommended_size=result["recommended_size"],
            size_action=result["size_action"],
            confidence=result["confidence"],
            heatmap_summary=result["heatmap_summary"],
            explanation=result["explanation"],
            heatmap_task_id=task_id,
        )

    except Exception as e:
        logger.error(f"Fit evaluation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Lỗi đánh giá độ vừa: {e}")


@router.get("/heatmap/{task_id}", response_model=HeatmapResponse)
def get_heatmap(task_id: str):
    """
    Lấy dữ liệu heatmap khoảng cách (mm) từ đỉnh áo tới thân theo task_id
    từ response của /fit/evaluate.
    """
    entry = _heatmap_cache.get(task_id)
    if not entry:
        raise HTTPException(
            status_code=404,
            detail=f"Heatmap task_id '{task_id}' không tìm thấy hoặc đã hết hạn."
        )
    return HeatmapResponse(
        task_id=task_id,
        distances_mm=entry["distances_mm"],
        heatmap_summary=entry["heatmap_summary"],
        garment_vert_count=entry["garment_vert_count"],
    )


@router.post("/evaluate-quick")
def evaluate_fit_quick(req: FitEvaluateRequest):
    """
    Phiên bản nhanh: chỉ trả ease từ bảng size (không cần load GLB mesh).
    Dùng khi GLB chưa generate mà chỉ có bảng size.
    Độ tin cậy thấp hơn (0.55).
    """
    if not req.size_chart:
        raise HTTPException(status_code=400, detail="size_chart bắt buộc cho evaluate-quick.")

    sz = req.current_size.upper()
    sc_entry = req.size_chart.get(sz)
    if not sc_entry:
        raise HTTPException(status_code=404, detail=f"Size {sz} không có trong size_chart.")

    model = BodyModel(gender=req.gender)
    body_mesh = model.get_trimesh(betas=req.betas, pose="a_pose")
    if req.height_cm and abs(req.height_cm - 174.5) > 1.0:
        body_mesh.apply_scale([1.0, req.height_cm / 174.5, 1.0])
    body_meas = BodyMeasurements.extract_from_mesh(body_mesh)

    body_chest  = body_meas.get("chest_cm", 95.0)
    body_waist  = body_meas.get("waist_cm", 80.0)
    body_hip    = body_meas.get("hip_cm", 100.0)

    from core.fit_advisor import EASE_TARGETS_CM, classify_ease, FIT_LABELS, FitAdvisor
    gtype = req.garment_type.lower()
    if gtype not in EASE_TARGETS_CM:
        gtype = "default"
    et = EASE_TARGETS_CM[gtype]

    def _ease(garment_val: Optional[float], body_val: float, key: str) -> dict:
        if garment_val is None:
            return {"ease_cm": None, "fit": "unknown", "label": "Không có"}
        ease = garment_val - body_val
        fit  = classify_ease(ease, et.get(key, et["chest"]))
        return {"ease_cm": round(ease, 1), "fit": fit, "label": FIT_LABELS.get(fit, fit)}

    ease_by_region = {
        "chest": _ease(sc_entry.get("chest_cm"), body_chest, "chest"),
        "waist": _ease(sc_entry.get("waist_cm"), body_waist, "waist"),
        "hip":   _ease(sc_entry.get("hip_cm"),   body_hip,   "hip"),
    }

    primary_fit = ease_by_region["chest"].get("fit", "perfect")

    available = req.available_sizes or FitAdvisor.SIZE_ORDER
    sz_idx = FitAdvisor.SIZE_ORDER.index(sz) if sz in FitAdvisor.SIZE_ORDER else 2
    size_action = "keep"
    recommended_size = sz
    if primary_fit in ("very_tight", "tight"):
        for bigger in FitAdvisor.SIZE_ORDER[sz_idx + 1:]:
            if bigger in available:
                recommended_size = bigger; size_action = "size_up"; break
    elif primary_fit == "very_loose":
        for smaller in reversed(FitAdvisor.SIZE_ORDER[:sz_idx]):
            if smaller in available:
                recommended_size = smaller; size_action = "size_down"; break

    return {
        "source": "size_chart_only",
        "confidence": 0.55,
        "ease_by_region": ease_by_region,
        "overall_fit": primary_fit,
        "overall_fit_label": FIT_LABELS.get(primary_fit, primary_fit),
        "recommended_size": recommended_size,
        "size_action": size_action,
        "body_measurements": body_meas,
    }

