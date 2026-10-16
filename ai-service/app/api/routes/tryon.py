from fastapi import APIRouter, HTTPException, Header, UploadFile, File, Form, status
from typing import Optional
import time
import logging

from app.schemas.tryon import TryOnRequest, TryOnResponse
from app.tryon.orchestrator import TryOnOrchestrator, JobState
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/inference", response_model=TryOnResponse)
async def run_tryon_inference(
    payload: TryOnRequest,
    x_internal_token: Optional[str] = Header(None)
):
    """
    Thực thi quy trình thử đồ ảo qua URL hình ảnh với kiểm định chất lượng và điều phối tác vụ.
    """
    if x_internal_token and x_internal_token != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã định danh bảo mật nội bộ không hợp lệ."
        )

    orchestrator = TryOnOrchestrator.get_instance()
    task_id = payload.task_id or f"vton-{int(time.time()*1000)}"

    job = orchestrator.process_pipeline(
        task_id=task_id,
        person_url=payload.person_image_url,
        garment_url=payload.garment_image_url,
        category=payload.category,
        seed=payload.seed
    )

    return TryOnResponse(
        task_id=job.task_id,
        status=job.status.value,
        output_image_url=job.output_image_url,
        inference_time_ms=job.timings.get("total_ms", 0),
        timings=job.timings,
        diagnostics=job.validation_result.diagnostics.model_dump() if job.validation_result and job.validation_result.diagnostics else None,
        error_message=job.error_message
    )


@router.post("/upload-and-run", response_model=TryOnResponse)
async def upload_and_run_tryon(
    person_image: UploadFile = File(...),
    garment_url: Optional[str] = Form(None),
    garment_image: Optional[UploadFile] = File(None),
    category: str = Form("tops"),
    product_id: Optional[str] = Form(None),
    variant_id: Optional[str] = Form(None),
    seed: int = Form(42),
    x_internal_token: Optional[str] = Header(None)
):
    """
    Tiếp nhận ảnh người chụp trực tiếp từ người dùng, kiểm tra chất lượng và chạy thử đồ ảo.
    """
    if x_internal_token and x_internal_token != settings.INTERNAL_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã định danh bảo mật nội bộ không hợp lệ."
        )

    orchestrator = TryOnOrchestrator.get_instance()
    task_id = f"vton-{int(time.time()*1000)}"

    person_bytes = await person_image.read()
    garment_bytes = await garment_image.read() if garment_image else None

    job = orchestrator.process_pipeline(
        task_id=task_id,
        person_bytes=person_bytes,
        garment_bytes=garment_bytes,
        garment_url=garment_url,
        category=category,
        seed=seed
    )

    return TryOnResponse(
        task_id=job.task_id,
        status=job.status.value,
        output_image_url=job.output_image_url,
        inference_time_ms=job.timings.get("total_ms", 0),
        timings=job.timings,
        diagnostics=job.validation_result.diagnostics.model_dump() if job.validation_result and job.validation_result.diagnostics else None,
        error_message=job.error_message
    )


@router.get("/jobs/{task_id}")
async def get_job_status(task_id: str):
    """
    Truy vấn trạng thái tiến trình và các chỉ số thời gian thực thi của tác vụ thử đồ ảo.
    """
    orchestrator = TryOnOrchestrator.get_instance()
    job = orchestrator.get_job(task_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Không tìm thấy tác vụ với mã task_id={task_id}"
        )
    return job
