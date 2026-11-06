import os
import sys
import pytest
from fastapi.testclient import TestClient

# Add ml_service root to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.body_model import BodyModel
from core.measurements import BodyMeasurements
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    """Verify GET /health returns 200, valid service name and clear SMPL-X mode."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "ml_service"
    assert "smplx_mode" in data
    assert data["smplx_mode"] in ["mock", "official_smplx", "official_smpl"]

def test_missing_weights_fallback():
    """Verify that when SMPL-X weights are absent, mock mode is activated without crashing."""
    fake_path = os.path.join(BASE_DIR, "assets", "non_existent_smplx_dir")
    model = BodyModel(model_path=fake_path)
    assert model.is_mock is True
    verts, faces = model.build_mesh([0.0] * 10)
    assert len(verts) > 0
    assert len(faces) > 0

def test_betas_zero_reasonable_baseline():
    """
    Acceptance Criteria 1:
    Verify betas=0 produces reasonable height (~1.6 - 1.8 m)
    and all anthropometric measurements are strictly positive and stable.
    """
    model = BodyModel()
    mesh = model.get_trimesh([0.0] * 10)
    meas = BodyMeasurements.extract_from_mesh(mesh)

    # Stature should be in realistic human range ~160 to 180 cm (1.6 - 1.8 m)
    assert 160.0 <= meas["height_cm"] <= 180.0, f"Unexpected height: {meas['height_cm']}"

    # All measurements must be positive and non-zero
    for key, val in meas.items():
        assert val > 0.0, f"Measurement {key} must be positive, got {val}"

    # Check realistic human body proportions
    assert 75.0 <= meas["chest_cm"] <= 110.0, f"Unrealistic chest: {meas['chest_cm']}"
    assert 65.0 <= meas["waist_cm"] <= 95.0, f"Unrealistic waist: {meas['waist_cm']}"
    assert 70.0 <= meas["hip_cm"] <= 110.0, f"Unrealistic hip: {meas['hip_cm']}"
    assert 38.0 <= meas["shoulder_cm"] <= 60.0, f"Unrealistic shoulder: {meas['shoulder_cm']}"
    assert 45.0 <= meas["arm_length_cm"] <= 70.0, f"Unrealistic arm: {meas['arm_length_cm']}"
    assert 50.0 <= meas["torso_length_cm"] <= 80.0, f"Unrealistic torso: {meas['torso_length_cm']}"

def test_monotonic_growth_on_beta0():
    """
    Acceptance Criteria 2:
    Changing betas[0] (overall mass/BMI) causes chest circumference
    and height to change monotonically.
    """
    model = BodyModel()
    test_betas = [-2.0, -1.0, 0.0, 1.0, 2.0]

    chest_vals = []
    height_vals = []
    waist_vals = []

    for b in test_betas:
        mesh = model.get_trimesh([b] + [0.0] * 9)
        meas = BodyMeasurements.extract_from_mesh(mesh)
        chest_vals.append(meas["chest_cm"])
        height_vals.append(meas["height_cm"])
        waist_vals.append(meas["waist_cm"])

    # Verify strictly monotonic increasing
    for i in range(len(test_betas) - 1):
        assert chest_vals[i] < chest_vals[i + 1], (
            f"Chest not monotonic: {chest_vals[i]} >= {chest_vals[i + 1]} at beta {test_betas[i]}"
        )
        assert height_vals[i] < height_vals[i + 1], (
            f"Height not monotonic: {height_vals[i]} >= {height_vals[i + 1]} at beta {test_betas[i]}"
        )
        assert waist_vals[i] < waist_vals[i + 1], (
            f"Waist not monotonic: {waist_vals[i]} >= {waist_vals[i + 1]} at beta {test_betas[i]}"
        )

def test_post_body_measure_api():
    """Verify POST /body/measure receives betas and returns full measurement response."""
    payload = {
        "betas": [1.5, 0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        "pose": "T-pose"
    }
    response = client.post("/body/measure", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "height_cm" in data
    assert "chest_cm" in data
    assert "waist_cm" in data
    assert "hip_cm" in data
    assert "shoulder_cm" in data
    assert "arm_length_cm" in data
    assert "torso_length_cm" in data
    assert data["chest_cm"] > 90.0  # Increased due to beta0 = 1.5
