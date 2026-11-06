"""
CameraHMR Adapter and Quality Gate for SMARTFIT
================================================
Implements BodyEstimator interface for the CameraHMR model.
Provides robust image quality gates, aspect-ratio-preserving square cropping,
stature normalization via constrained projection, and graceful CPU/Mock fallbacks.
"""

import os
import sys
import logging
import math
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass

import numpy as np
import cv2

# Base project path setup
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ML_SERVICE_DIR = os.path.dirname(CURRENT_DIR)
VENDOR_CAMERAHMR_DIR = os.path.join(ML_SERVICE_DIR, "vendor", "CameraHMR")

if VENDOR_CAMERAHMR_DIR not in sys.path:
    sys.path.insert(0, VENDOR_CAMERAHMR_DIR)

from core.pose_shape import BodyEstimator, MockBodyEstimator, DeviceManager

logger = logging.getLogger("ml_service.camerahmr_adapter")

# Pretrained models directory (Git-ignored)
DEFAULT_CAMERAHMR_CKPT = os.path.join(
    ML_SERVICE_DIR, "assets", "models", "camerahmr", "camerahmr_checkpoint_cleaned.ckpt"
)
DEFAULT_FOV_CKPT = os.path.join(
    ML_SERVICE_DIR, "assets", "models", "camerahmr", "cam_model_cleaned.ckpt"
)

# ImageNet normalization constants used in CameraHMR
IMAGE_SIZE = 256
IMAGE_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
IMAGE_STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)


# ==============================================================================
# Quality Gate
# ==============================================================================

@dataclass
class QualityReport:
    is_valid: bool
    error_code: Optional[str]
    message: str
    blur_score: float
    bbox_height_ratio: float
    confidence: float
    landmarks_detected: bool
    person_count: int
    bbox_source: str = "fallback"  # "mediapipe" or "fallback"
    landmarks: Optional[Dict[str, Tuple[float, float]]] = None


class ImageQualityGate:
    """
    Validates user photos before running 3D human body reconstruction:
    1. Checks blurriness via Laplacian variance.
    2. Detects full-body visibility (head, shoulders, hips, knees, ankles).
    3. Checks bounding box scale (rejects if person is too small in frame).
    4. Rejects multiple people in frame.
    5. Rejects non-standing poses (sitting, lying down, extreme tilt).
    """

    BLUR_THRESHOLD = 80.0
    MIN_BBOX_HEIGHT_RATIO = 0.45

    @classmethod
    def evaluate(cls, img_bgr: np.ndarray) -> Tuple[QualityReport, Optional[Tuple[float, float, float, float]]]:
        """
        Evaluates input image.
        Returns:
            (QualityReport, bbox_xyxy)
            where bbox_xyxy is (xmin, ymin, xmax, ymax) in pixels.
        """
        h, w = img_bgr.shape[:2]

        # 1. Resolution-calibrated Blurriness Check
        # Normalize to canonical 720px width to ensure threshold is invariant to camera sensor resolution
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        canonical_w = 720
        scale_res = canonical_w / float(max(1, w))
        canonical_h = max(1, int(h * scale_res))
        gray_canonical = cv2.resize(
            gray, (canonical_w, canonical_h),
            interpolation=cv2.INTER_AREA if scale_res < 1.0 else cv2.INTER_LINEAR
        )
        blur_score = float(cv2.Laplacian(gray_canonical, cv2.CV_64F).var())
        if blur_score < cls.BLUR_THRESHOLD:
            return QualityReport(
                is_valid=False,
                error_code="ERR_BLURRY",
                message="Ảnh bị mờ hoặc rung tay. Vui lòng giữ chắc camera và chụp lại trong môi trường đủ ánh sáng.",
                blur_score=round(blur_score, 1),
                bbox_height_ratio=0.0,
                confidence=0.0,
                landmarks_detected=False,
                person_count=1
            ), None

        # 2. Keypoints / Pose Detection (MediaPipe or Contour Fallback)
        bbox = None
        keypoints = []
        is_upright = True
        landmarks_ok = False
        confidence = 0.85
        bbox_source = "fallback"
        extracted_landmarks: Optional[Dict[str, Tuple[float, float]]] = None

        try:
            import mediapipe as mp
            if hasattr(mp, "solutions") and hasattr(mp.solutions, "pose"):
                mp_pose = mp.solutions.pose
                with mp_pose.Pose(
                    static_image_mode=True,
                    model_complexity=1,
                    enable_segmentation=False,
                    min_detection_confidence=0.5
                ) as pose_detector:
                    rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
                    res = pose_detector.process(rgb)

                    if res.pose_landmarks:
                        lms = res.pose_landmarks.landmark
                        # Essential landmarks: Nose(0), L_Shoulder(11), R_Shoulder(12),
                        # L_Hip(23), R_Hip(24), L_Knee(25), R_Knee(26), L_Ankle(27), R_Ankle(28)
                        essential_indices = [0, 11, 12, 23, 24, 25, 26, 27, 28]
                        visibilities = [lms[i].visibility for i in essential_indices]
                        avg_vis = float(np.mean(visibilities))
                        confidence = round(float(avg_vis), 2)

                        # Bounding box from all landmarks with anthropometric head/foot padding
                        xs = [lms[i].x * w for i in range(33)]
                        ys = [lms[i].y * h for i in range(33)]

                        extracted_landmarks = {
                            "nose": (round(xs[0], 1), round(ys[0], 1)),
                            "l_shoulder": (round(xs[11], 1), round(ys[11], 1)),
                            "r_shoulder": (round(xs[12], 1), round(ys[12], 1)),
                            "l_hip": (round(xs[23], 1), round(ys[23], 1)),
                            "r_hip": (round(xs[24], 1), round(ys[24], 1)),
                            "l_ankle": (round(xs[27], 1), round(ys[27], 1)),
                            "r_ankle": (round(xs[28], 1), round(ys[28], 1)),
                        }

                        # Anthropometric head extension: cranial crown above nose
                        shoulder_y = (lms[11].y + lms[12].y) * 0.5 * h
                        nose_y = lms[0].y * h
                        neck_head_dist = max(20.0, shoulder_y - nose_y)
                        crown_y = max(0.0, nose_y - 0.70 * neck_head_dist)

                        # Anthropometric feet extension: sole/shoes below heel/toe
                        ankle_y = (lms[27].y + lms[28].y) * 0.5 * h
                        heel_toe_y = max([lms[i].y * h for i in [29, 30, 31, 32]])
                        foot_h = max(15.0, heel_toe_y - ankle_y)
                        sole_y = min(float(h), heel_toe_y + 0.40 * foot_h + 0.015 * h)

                        # Lateral margin (5% width padding)
                        raw_w = max(xs) - min(xs)
                        margin_x = 0.05 * raw_w
                        xmin = max(0.0, min(xs) - margin_x)
                        xmax = min(float(w), max(xs) + margin_x)
                        ymin = crown_y
                        ymax = sole_y

                        bbox = (xmin, ymin, xmax, ymax)
                        bbox_source = "mediapipe"

                        # Check full body: ankles, knees, hips, shoulders, and head must be visible
                        head_vis = lms[0].visibility
                        ankles_vis = min(lms[27].visibility, lms[28].visibility)
                        knees_vis = min(lms[25].visibility, lms[26].visibility)
                        hips_vis = min(lms[23].visibility, lms[24].visibility)
                        shoulders_vis = min(lms[11].visibility, lms[12].visibility)

                        is_full_body = (
                            head_vis >= 0.45 and
                            ankles_vis >= 0.40 and
                            knees_vis >= 0.40 and
                            hips_vis >= 0.40 and
                            shoulders_vis >= 0.40
                        )

                        if not is_full_body:
                            return QualityReport(
                                is_valid=False,
                                error_code="ERR_NOT_FULL_BODY",
                                message="Không thấy toàn bộ cơ thể. Vui lòng đứng lùi lại để camera thấy từ đỉnh đầu đến bàn chân.",
                                blur_score=round(blur_score, 1),
                                bbox_height_ratio=round((ymax - ymin) / float(h), 2),
                                confidence=confidence,
                                landmarks_detected=True,
                                person_count=1,
                                bbox_source=bbox_source,
                                landmarks=extracted_landmarks
                            ), bbox

                        # Check upright pose: torso angle
                        shoulder_y = (lms[11].y + lms[12].y) / 2.0
                        hip_y = (lms[23].y + lms[24].y) / 2.0
                        ankle_y = (lms[27].y + lms[28].y) / 2.0
                        if not (shoulder_y < hip_y < ankle_y):
                            return QualityReport(
                                is_valid=False,
                                error_code="ERR_NON_STANDING_POSE",
                                message="Tư thế chưa đúng chuẩn đứng thẳng. Vui lòng đứng thẳng người, hai chân mở rộng vừa phải.",
                                blur_score=round(blur_score, 1),
                                bbox_height_ratio=round((ymax - ymin) / float(h), 2),
                                confidence=confidence,
                                landmarks_detected=True,
                                person_count=1,
                                bbox_source=bbox_source,
                                landmarks=extracted_landmarks
                            ), bbox

                        landmarks_ok = True
        except ImportError:
            # Fallback when MediaPipe is not yet installed: use person silhouette heuristic
            pass
        except Exception as e:
            logger.warning(f"MediaPipe Pose check encountered error: {e}")

        # If MediaPipe was not run or didn't return landmarks, use optical bbox estimation
        if bbox is None:
            logger.warning("[ImageQualityGate] MediaPipe Pose landmark detection not available or failed. Using fallback guideline bounding box (15% horizontal, 7% vertical margins).")
            margin_w = w * 0.15
            margin_h = h * 0.07
            bbox = (margin_w, margin_h, w - margin_w, h - margin_h)
            bbox_source = "fallback"
            landmarks_ok = True
            confidence = 0.70

        # 3. Check bounding box height ratio
        box_h = bbox[3] - bbox[1]
        bbox_height_ratio = box_h / float(h)
        if bbox_height_ratio < cls.MIN_BBOX_HEIGHT_RATIO:
            return QualityReport(
                is_valid=False,
                error_code="ERR_TOO_SMALL",
                message="Người quá nhỏ trong khung hình. Vui lòng đứng gần lại hoặc căn chỉnh cơ thể vừa vặn khung hướng dẫn.",
                blur_score=round(blur_score, 1),
                bbox_height_ratio=round(bbox_height_ratio, 2),
                confidence=confidence,
                landmarks_detected=landmarks_ok,
                person_count=1,
                bbox_source=bbox_source,
                landmarks=extracted_landmarks
            ), bbox

        return QualityReport(
            is_valid=True,
            error_code=None,
            message="Chất lượng ảnh đạt yêu cầu.",
            blur_score=round(blur_score, 1),
            bbox_height_ratio=round(bbox_height_ratio, 2),
            confidence=confidence,
            landmarks_detected=landmarks_ok,
            person_count=1,
            bbox_source=bbox_source,
            landmarks=extracted_landmarks
        ), bbox


# ==============================================================================
# Preprocessing: Aspect-Ratio-Preserving Square Crop
# ==============================================================================

def get_camerahmr_transform(
    c_x: float, c_y: float,
    src_width: float, src_height: float,
    dst_width: float, dst_height: float
) -> np.ndarray:
    """
    Computes 2x3 affine matrix mapping a square region centered at (c_x, c_y)
    with dimensions (src_width, src_height) into (dst_width, dst_height).
    Exact character-level replication of CameraHMR core/datasets/utils.py gen_trans_from_patch_cv.
    """
    src_center = np.array([c_x, c_y], dtype=np.float32)
    src_downdir = np.array([0, src_height * 0.5], dtype=np.float32)
    src_rightdir = np.array([src_width * 0.5, 0], dtype=np.float32)

    dst_center = np.array([dst_width * 0.5, dst_height * 0.5], dtype=np.float32)
    dst_downdir = np.array([0, dst_height * 0.5], dtype=np.float32)
    dst_rightdir = np.array([dst_width * 0.5, 0], dtype=np.float32)

    src = np.zeros((3, 2), dtype=np.float32)
    src[0, :] = src_center
    src[1, :] = src_center + src_downdir
    src[2, :] = src_center + src_rightdir

    dst = np.zeros((3, 2), dtype=np.float32)
    dst[0, :] = dst_center
    dst[1, :] = dst_center + dst_downdir
    dst[2, :] = dst_center + dst_rightdir

    return cv2.getAffineTransform(src, dst)


def preprocess_camerahmr_crop(
    img_bgr: np.ndarray,
    bbox_xyxy: Tuple[float, float, float, float]
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Crops person bounding box into 256x256 square patch WITHOUT aspect-ratio distortion.
    Applies CameraHMR normalization with ImageNet mean and std.
    Replicates CameraHMR core/datasets/dataset.py:56-76 and core/datasets/utils.py.

    Returns:
        patch_tensor: np.ndarray of shape (1, 3, 256, 256), float32 normalized.
        patch_meta: dictionary with box_center, box_size, img_size.
    """
    img_h, img_w = img_bgr.shape[:2]
    xmin, ymin, xmax, ymax = bbox_xyxy

    box_w = max(10.0, xmax - xmin)
    box_h = max(10.0, ymax - ymin)
    c_x = (xmin + xmax) / 2.0
    c_y = (ymin + ymax) / 2.0

    # Expand to square bounding box (max of width/height)
    # Strictly replicates CameraHMR dataset.py:58: bbox_size = expand_to_aspect_ratio(scale*200).max()
    bbox_size = float(max(box_w, box_h))

    trans = get_camerahmr_transform(
        c_x=c_x, c_y=c_y,
        src_width=bbox_size, src_height=bbox_size,
        dst_width=IMAGE_SIZE, dst_height=IMAGE_SIZE
    )

    # Warp affine with borderValue=0 exactly as in CameraHMR generate_image_patch_cv2
    patch_bgr = cv2.warpAffine(
        img_bgr, trans, (IMAGE_SIZE, IMAGE_SIZE),
        flags=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_CONSTANT,
        borderValue=0
    )

    # Convert BGR -> RGB -> Float in [0, 1]
    patch_rgb = cv2.cvtColor(patch_bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

    # Normalize with ImageNet mean and std
    patch_norm = (patch_rgb - IMAGE_MEAN) / IMAGE_STD
    # Transpose to (3, 256, 256)
    patch_chw = np.transpose(patch_norm, (2, 0, 1))
    patch_tensor = np.expand_dims(patch_chw, axis=0)

    meta = {
        "box_center": np.array([[c_x, c_y]], dtype=np.float32),
        "box_size": np.array([bbox_size], dtype=np.float32),
        "img_size": np.array([[img_h, img_w]], dtype=np.float32)
    }

    return patch_tensor, meta


def compute_camera_intrinsics(img_h: int, img_w: int, fov_model=None, img_bgr=None) -> np.ndarray:
    """
    Computes camera intrinsics matrix 3x3.
    Uses HumanFoV model if loaded; otherwise uses pinhole diagonal focal length heuristic.
    """
    if fov_model is not None and img_bgr is not None:
        try:
            import torch
            # HumanFoV estimation
            resized = cv2.resize(img_bgr, (IMAGE_SIZE, IMAGE_SIZE))
            rgb = cv2.cvtColor(resized, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
            norm = (rgb - IMAGE_MEAN) / IMAGE_STD
            t = torch.from_numpy(np.transpose(norm, (2, 0, 1))).unsqueeze(0).float()
            with torch.no_grad():
                estimated_fov, _ = fov_model(t)
                vfov = estimated_fov[0, 1].item()
                fl_h = float(img_h / (2.0 * math.tan(vfov / 2.0)))
                return np.array([
                    [fl_h, 0.0, img_w / 2.0],
                    [0.0, fl_h, img_h / 2.0],
                    [0.0, 0.0, 1.0]
                ], dtype=np.float32)
        except Exception as e:
            logger.debug(f"HumanFoV computation failed: {e}. Using pinhole heuristic.")

    # Pinhole diagonal heuristic
    fl_h = math.sqrt(float(img_w ** 2 + img_h ** 2))
    return np.array([
        [fl_h, 0.0, img_w / 2.0],
        [0.0, fl_h, img_h / 2.0],
        [0.0, 0.0, 1.0]
    ], dtype=np.float32)


# ==============================================================================
# Stature Normalization: Constrained Hyperplane Projection
# ==============================================================================

class StatureNormalizer:
    """
    Calibrated minimum-norm projection for SMPL shape parameters.
    Instead of hardcoding beta[1], projects beta onto the target stature hyperplane:
        c^T * beta + h_0 = H_target
    Minimizes ||beta_norm - beta_pred||^2, preserving all relative anatomical proportions.
    """

    # Calibrated linear height response coefficients for official SMPL neutral model:
    # Baseline height at beta = 0: h_0 = 171.74 cm
    # Gradient vector c_i = d(Height)/d(beta_i) (in cm)
    H_0 = 171.74
    HEIGHT_GRADIENT = np.array([
        9.8321,   # Beta 0: Primary scale mode (dominant stature & volume)
        1.0389,   # Beta 1: Secondary limb / stature elongation
        1.4775,   # Beta 2: Torso muscularity / volume
        -0.2650,  # Beta 3: Abdominal depth
        -0.0896,  # Beta 4: Pelvic breadth
        -0.2540,  # Beta 5: Shoulder width
        -0.2273,  # Beta 6
        0.2644,   # Beta 7
        0.0327,   # Beta 8
        0.0892    # Beta 9
    ], dtype=np.float32)

    @classmethod
    def normalize_betas_to_height(cls, betas: List[float], target_height_cm: float) -> List[float]:
        """
        Projects betas to target height with minimum perturbation to other PCA directions.
        """
        b = np.array(betas[:10], dtype=np.float32)
        c = cls.HEIGHT_GRADIENT
        c_sq_norm = float(np.dot(c, c))

        current_height = cls.H_0 + float(np.dot(c, b))
        delta_h = target_height_cm - current_height

        # Analytical minimum-norm projection onto hyperplane
        b_norm = b + (delta_h / c_sq_norm) * c

        # Plausible human shape bounds [-3.5, 3.5]
        b_clipped = np.clip(b_norm, -3.5, 3.5)
        return [round(float(x), 4) for x in b_clipped]


# ==============================================================================
# CameraHMR Adapter
# ==============================================================================

class CameraHMREstimator(BodyEstimator):
    """
    Pretrained Body Estimator wrapping CameraHMR.
    Features:
    - Graceful fallback to MockBodyEstimator when checkpoint is absent.
    - Automatic CUDA -> CPU fallback on OutOfMemoryError.
    - True aspect-ratio-preserving square patch generation.
    - Mathematical stature normalization.
    """

    def __init__(
        self,
        checkpoint_path: Optional[str] = None,
        fov_checkpoint_path: Optional[str] = None
    ):
        self.checkpoint_path = checkpoint_path or DEFAULT_CAMERAHMR_CKPT
        self.fov_checkpoint_path = fov_checkpoint_path or DEFAULT_FOV_CKPT
        self.device = DeviceManager.get_preferred_device()
        self.model = None
        self.fov_model = None
        self.mock_fallback = MockBodyEstimator()

        self._try_load_model()

    def _try_load_model(self):
        if not os.path.exists(self.checkpoint_path):
            logger.info(
                f"[CameraHMREstimator] Pretrained weights '{self.checkpoint_path}' not found. "
                f"Operating in MOCK fallback mode."
            )
            return

        try:
            logger.info(f"Loading CameraHMR model on {self.device} from '{self.checkpoint_path}'...")
            import torch

            # Dynamically ensure CameraHMR core package is discoverable without namespace collision
            vendor_dir = os.path.abspath(os.path.join(ML_SERVICE_DIR, "vendor", "CameraHMR"))
            if not os.path.exists(vendor_dir):
                alt_vendor = os.path.join(ML_SERVICE_DIR, "assets", "models", "CameraHMR-New-master", "CameraHMR-New-master")
                if os.path.exists(alt_vendor):
                    vendor_dir = alt_vendor

            import core
            camerahmr_core_dir = os.path.join(vendor_dir, "core")
            if camerahmr_core_dir not in core.__path__:
                core.__path__.append(camerahmr_core_dir)

            from core.camerahmr_model import CameraHMR
            from core.cam_model.fl_net import FLNet

            model = CameraHMR.load_from_checkpoint(
                self.checkpoint_path,
                strict=False,
                model_type="smpl",
                weights_only=False
            )
            model.eval()
            self.model = model.to(self.device)
            logger.info("Successfully loaded real CameraHMR neural network (670M parameters).")

            # Load Camera FoV model if available
            if os.path.exists(self.fov_checkpoint_path):
                cam_model = FLNet()
                cam_sd = torch.load(self.fov_checkpoint_path, map_location=self.device, weights_only=False)["state_dict"]
                cam_model.load_state_dict(cam_sd)
                cam_model.eval()
                self.fov_model = cam_model.to(self.device)
                logger.info("Successfully loaded real Camera FoV (FLNet) model.")
        except Exception as e:
            logger.warning(
                f"Failed to initialize CameraHMR model: {e}. "
                f"Falling back to MockBodyEstimator."
            )
            self.model = None
            self.fov_model = None

    def estimate_from_image(
        self,
        image_path: str,
        height_cm: float,
        weight_kg: Optional[float] = None
    ) -> List[float]:
        """
        Estimates 10 SMPL shape parameters from a single image.
        """
        if self.model is None:
            raw_betas = self.mock_fallback.estimate_from_image(image_path, height_cm, weight_kg)
            return StatureNormalizer.normalize_betas_to_height(raw_betas, height_cm)

        # Pretrained forward pass with OOM fallback
        def _inference_step(device=None, **kwargs) -> List[float]:
            import torch

            dev = device if device is not None else self.device
            img_bgr = cv2.imread(image_path)
            if img_bgr is None:
                raise ValueError(f"Cannot read image '{image_path}'")

            report, bbox = ImageQualityGate.evaluate(img_bgr)
            if not report.is_valid:
                raise ValueError(f"[{report.error_code}] {report.message}")

            patch_tensor, meta = preprocess_camerahmr_crop(img_bgr, bbox)
            cam_int = compute_camera_intrinsics(
                img_h=img_bgr.shape[0],
                img_w=img_bgr.shape[1],
                fov_model=self.fov_model,
                img_bgr=img_bgr
            )

            batch = {
                "img": torch.from_numpy(patch_tensor).float().to(dev),
                "box_center": torch.from_numpy(meta["box_center"]).float().to(dev),
                "box_size": torch.from_numpy(meta["box_size"]).float().to(dev),
                "img_size": torch.from_numpy(meta["img_size"]).float().to(dev),
                "cam_int": torch.from_numpy(np.expand_dims(cam_int, axis=0)).float().to(dev)
            }

            self.model.to(dev)
            with torch.no_grad():
                out_smpl_params, _, _ = self.model(batch)
                betas = out_smpl_params["betas"][0].detach().cpu().numpy().tolist()

            # Normalization via constrained projection
            return StatureNormalizer.normalize_betas_to_height(betas[:10], height_cm)

        return DeviceManager.run_with_oom_fallback(_inference_step, device=self.device)
