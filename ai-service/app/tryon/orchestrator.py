import uuid
import time
import logging
from typing import Dict, Any, Optional
from enum import Enum
from pydantic import BaseModel, Field

from app.tryon.validator import TryOnInputValidator, ValidationResult
from app.tryon.adapter import TryOnModelAdapter

logger = logging.getLogger(__name__)

class JobState(str, Enum):
    QUEUED = "queued"
    VALIDATING = "validating"
    PREPROCESSING = "preprocessing"
    INFERENCING = "inferencing"
    POSTPROCESSING = "postprocessing"
    SUCCEEDED = "succeeded"
    FAILED = "failed"

class JobProgress(BaseModel):
    task_id: str
    status: JobState
    progress_percent: int
    step_description: str
    created_at: float
    updated_at: float
    output_image_url: Optional[str] = None
    validation_result: Optional[ValidationResult] = None
    timings: Dict[str, int] = Field(default_factory=dict)
    error_message: Optional[str] = None
    product_id: Optional[str] = None
    variant_id: Optional[str] = None

class TryOnOrchestrator:
    """
    Bộ điều phối quy trình thử đồ ảo (VTON Pipeline Orchestrator).
    Đảm bảo quy trình khép kín:
    Xác thực đầu vào -> Tiền xử lý -> Suy luận mô hình -> Hậu xử lý -> Kiểm định đầu ra -> Phân phối kết quả.
    Quản lý vòng đời trạng thái tác vụ, theo dõi tiến trình và ghi nhận nhật ký độ trễ.
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.jobs: Dict[str, JobProgress] = {}
        self.validator = TryOnInputValidator
        self.adapter = TryOnModelAdapter.get_instance()
        logger.info("Khởi tạo TryOnOrchestrator thành công.")

    def create_job(
        self,
        product_id: Optional[str] = None,
        variant_id: Optional[str] = None,
        custom_task_id: Optional[str] = None
    ) -> JobProgress:
        task_id = custom_task_id or f"vton-{uuid.uuid4().hex[:12]}"
        now = time.time()
        job = JobProgress(
            task_id=task_id,
            status=JobState.QUEUED,
            progress_percent=5,
            step_description="Tác vụ đã vào hàng đợi xử lý",
            created_at=now,
            updated_at=now,
            product_id=product_id,
            variant_id=variant_id
        )
        self.jobs[task_id] = job
        return job

    def get_job(self, task_id: str) -> Optional[JobProgress]:
        return self.jobs.get(task_id)

    def process_pipeline(
        self,
        task_id: str,
        person_bytes: Optional[bytes] = None,
        person_url: Optional[str] = None,
        garment_bytes: Optional[bytes] = None,
        garment_url: Optional[str] = None,
        category: str = "tops",
        seed: int = 42
    ) -> JobProgress:
        """
        Thực thi tuần tự toàn bộ đường ống với quản lý trạng thái có cấu trúc.
        """
        job = self.jobs.get(task_id)
        if not job:
            job = self.create_job(custom_task_id=task_id)

        t_start = time.time()
        timings = {}

        try:
            # GIAI ĐOẠN 1: KIỂM ĐỊNH CHẤT LƯỢNG ĐẦU VÀO (INPUT VALIDATION)
            job.status = JobState.VALIDATING
            job.progress_percent = 20
            job.step_description = "Đang kiểm định chất lượng ảnh người và tỷ lệ khung hình..."
            job.updated_at = time.time()

            t_val = time.time()
            if person_bytes:
                val_res = self.validator.validate_person_image(person_bytes)
                job.validation_result = val_res
                if not val_res.is_valid:
                    job.status = JobState.FAILED
                    job.error_message = f"[{val_res.error_code}] {val_res.message}"
                    job.updated_at = time.time()
                    logger.warning(f"Tác vụ {task_id} bị từ chối ở bước kiểm định: {job.error_message}")
                    return job
            timings["validation_ms"] = int((time.time() - t_val) * 1000)

            # GIAI ĐOẠN 2 & 3: TIỀN XỬ LÝ & SUY LUẬN MÔ HÌNH (INFERENCE)
            job.status = JobState.INFERENCING
            job.progress_percent = 60
            job.step_description = "Đang tổng hợp phom dáng và hòa trộn nếp vải (Adapter Execution)..."
            job.updated_at = time.time()

            person_source = person_bytes if person_bytes else person_url
            garment_source = garment_bytes if garment_bytes else garment_url

            inference_output = self.adapter.execute_inference(
                task_id=task_id,
                person_source=person_source,
                garment_source=garment_source,
                category=category,
                seed=seed
            )

            # Gộp timings từ adapter
            for k, v in inference_output["timings"].items():
                timings[k] = v

            # GIAI ĐOẠN 4: HẬU XỬ LÝ & HOÀN THIỆN
            job.status = JobState.SUCCEEDED
            job.progress_percent = 100
            job.step_description = "Hoàn tất thử đồ ảo thành công."
            job.output_image_url = inference_output["output_url"]
            job.timings = timings
            job.updated_at = time.time()

            logger.info(f"Tác vụ {task_id} thành công! Tổng thời gian: {timings.get('total_ms', 0)}ms")
            return job

        except Exception as e:
            job.status = JobState.FAILED
            job.progress_percent = 100
            job.error_message = f"Lỗi thực thi đường ống: {str(e)}"
            job.updated_at = time.time()
            logger.error(f"Tác vụ {task_id} thất bại: {e}", exc_info=True)
            return job
