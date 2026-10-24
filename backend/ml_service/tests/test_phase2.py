import os
import sys
import io
import pytest
import numpy as np
import cv2
from fastapi.testclient import TestClient

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app.main import app
from core.pose_shape import DeviceManager, ImageValidator, MockBodyEstimator, BodyEstimationPipeline

client = TestClient(app)

def create_dummy_portrait_image_bytes(width=300, height=600) -> bytes:
    """Generates a valid portrait synthetic test image representing full body silhouette."""
    img = np.ones((height, width, 3), dtype=np.uint8) * 240
    # Draw simple human silhouette (head, torso, legs)
    cv2.circle(img, (width // 2, 80), 30, (80, 80, 80), -1)  # Head
    cv2.rectangle(img, (width // 2 - 40, 120), (width // 2 + 40, 320), (100, 100, 100), -1)  # Torso
    cv2.rectangle(img, (width // 2 - 35, 320), (width // 2 - 10, 540), (70, 70, 70), -1)  # Left leg
    cv2.rectangle(img, (width // 2 + 10, 320), (width // 2 + 35, 540), (70, 70, 70), -1)  # Right leg
    is_success, buffer = cv2.imencode(".jpg", img)
    assert is_success
    return buffer.tobytes()

def test_image_validator():
    """Verify ImageValidator checks format, readability and dimension thresholds."""
    # Test non-existent file
    valid, msg = ImageValidator.validate_image("non_existent_file.jpg")
    assert not valid

    # Test valid image file
    temp_path = os.path.join(BASE_DIR, "assets", "temp_test_val.jpg")
    img_bytes = create_dummy_portrait_image_bytes()
    with open(temp_path, "wb") as f:
        f.write(img_bytes)

    try:
        valid, msg = ImageValidator.validate_image(temp_path)
        assert valid, f"Expected valid image, got: {msg}"
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

def test_post_body_estimate_and_privacy_cleanup():
    """
    Acceptance Criteria:
    - Calls POST /body/estimate with sample image
    - Returns valid 10 betas and positive anthropometric measurements
    - VERIFIES no temporary image remains on disk after processing!
    """
    img_bytes = create_dummy_portrait_image_bytes()
    temp_dir = os.path.join(BASE_DIR, "assets", "temp")

    response = client.post(
        "/body/estimate",
        data={
            "height_cm": 178.0,
            "weight_kg": 72.0,
            "privacy_agreed": True
        },
        files={
            "image_front": ("front.jpg", io.BytesIO(img_bytes), "image/jpeg")
        }
    )

    assert response.status_code == 200, f"Error: {response.text}"
    data = response.json()
    assert data["status"] == "success"
    assert len(data["betas"]) == 10
    assert data["height_cm"] == 178.0
    assert data["privacy_cleaned"] is True
    assert "measurements" in data

    meas = data["measurements"]
    assert meas["height_cm"] == 178.0
    assert meas["chest_cm"] > 0
    assert meas["waist_cm"] > 0
    assert meas["hip_cm"] > 0

    # Privacy check: verify temporary image directory does not contain leftover test files
    if os.path.exists(temp_dir):
        remaining_files = os.listdir(temp_dir)
        # Any file starting with front_ or side_ should have been deleted
        active_uploads = [f for f in remaining_files if f.startswith("front_") or f.startswith("side_")]
        assert len(active_uploads) == 0, f"Temporary upload files were not cleaned up: {active_uploads}"

def test_multi_view_fusion():
    """Verify dual image (front + side) inputs perform weighted parameter fusion."""
    front_bytes = create_dummy_portrait_image_bytes(300, 600)
    side_bytes = create_dummy_portrait_image_bytes(250, 600)

    response = client.post(
        "/body/estimate",
        data={
            "height_cm": 172.0,
            "weight_kg": 68.0,
            "privacy_agreed": True
        },
        files={
            "image_front": ("front.jpg", io.BytesIO(front_bytes), "image/jpeg"),
            "image_side": ("side.jpg", io.BytesIO(side_bytes), "image/jpeg")
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert data["has_side_image"] is True
    assert len(data["betas"]) == 10

def test_height_normalization():
    """Verify input real stature strictly scales the body model output."""
    img_bytes = create_dummy_portrait_image_bytes()

    res_short = client.post(
        "/body/estimate",
        data={"height_cm": 158.0, "privacy_agreed": True},
        files={"image_front": ("front.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    ).json()

    res_tall = client.post(
        "/body/estimate",
        data={"height_cm": 188.0, "privacy_agreed": True},
        files={"image_front": ("front.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    ).json()

    assert res_short["height_cm"] == 158.0
    assert res_tall["height_cm"] == 188.0
    # Stature beta component (betas[1]) should be lower for shorter height and higher for taller height
    assert res_short["betas"][1] < res_tall["betas"][1]

def test_privacy_consent_rejection():
    """Verify request without privacy agreement is rejected with HTTP 400."""
    img_bytes = create_dummy_portrait_image_bytes()
    response = client.post(
        "/body/estimate",
        data={"height_cm": 175.0, "privacy_agreed": False},
        files={"image_front": ("front.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    )
    assert response.status_code == 400
    assert "privacy" in response.text.lower()

def test_device_manager_fallback():
    """Verify DeviceManager handles device resolution and fallback without crashing."""
    dev = DeviceManager.get_preferred_device()
    assert dev in ["cuda", "cpu"]

    # Test fallback runner on basic operation
    res = DeviceManager.run_with_oom_fallback(lambda: 42)
    assert res == 42
