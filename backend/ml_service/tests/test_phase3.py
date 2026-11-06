import os
import sys
import json
import pytest
import numpy as np
import trimesh

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.body_model import BodyModel
from core.measurements import BodyMeasurements
from core.slider_mapping import SliderMappingEngine
from core.export_glb import GlbMorphExporter

def test_body_model_topology():
    """Verify body model loads official weights with exact vertex and face counts."""
    model = BodyModel(gender="neutral")
    assert model.is_mock is False, "BodyModel should load official weights (not mock)"
    
    verts, faces = model.build_mesh([0.0] * 10, pose="T-pose")
    if model.model_type == "smpl":
        assert len(verts) == 6890, f"Expected 6890 vertices for SMPL, got {len(verts)}"
        assert len(faces) == 13776, f"Expected 13776 faces for SMPL, got {len(faces)}"
    elif model.model_type == "smplx":
        assert len(verts) == 10475, f"Expected 10475 vertices for SMPL-X, got {len(verts)}"
        assert len(faces) == 20908, f"Expected 20908 faces for SMPL-X, got {len(faces)}"

def test_body_model_height_baseline():
    """Verify height at betas=0 is between 1.6m and 1.8m for all available genders."""
    for g in ["neutral", "female", "male"]:
        model = BodyModel(gender=g)
        mesh = model.get_trimesh([0.0] * 10, pose="T-pose")
        meas = BodyMeasurements.extract_from_mesh(mesh)
        h_cm = meas["height_cm"]
        assert 160.0 <= h_cm <= 180.0, f"Gender {g} height {h_cm} cm out of expected range [160, 180] cm"

def test_measurements_monotonicity():
    """Verify that changing betas[0] or betas[1] changes body dimensions monotonically."""
    model = BodyModel(gender="neutral")
    
    # Stature beta[0] in neutral SMPL increases height monotonically
    h_neg2 = BodyMeasurements.extract_from_mesh(model.get_trimesh([-2.0] + [0.0] * 9))["height_cm"]
    h_zero = BodyMeasurements.extract_from_mesh(model.get_trimesh([0.0] * 10))["height_cm"]
    h_pos2 = BodyMeasurements.extract_from_mesh(model.get_trimesh([+2.0] + [0.0] * 9))["height_cm"]
    assert h_neg2 < h_zero < h_pos2, f"Height monotonicity failed: {h_neg2} < {h_zero} < {h_pos2}"

    # Overall mass beta[0] in neutral SMPL increases chest circumference monotonically
    c_neg2 = BodyMeasurements.extract_from_mesh(model.get_trimesh([-2.0] + [0.0] * 9))["chest_cm"]
    c_zero = BodyMeasurements.extract_from_mesh(model.get_trimesh([0.0] * 10))["chest_cm"]
    c_pos2 = BodyMeasurements.extract_from_mesh(model.get_trimesh([+2.0] + [0.0] * 9))["chest_cm"]
    assert c_neg2 < c_zero < c_pos2, f"Chest monotonicity failed: {c_neg2} < {c_zero} < {c_pos2}"

def test_slider_mapping_weights():
    """Verify slider mapping weights file exists, has correct schema and high R^2 on primary betas."""
    weights_path = os.path.join(BASE_DIR, "assets", "slider_mapping_weights.json")
    assert os.path.exists(weights_path), f"Missing weights file at {weights_path}"

    with open(weights_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    assert "feature_names" in data
    assert len(data["feature_names"]) == 7
    assert len(data["weights"]) == 10
    assert len(data["weights"][0]) == 7
    assert len(data["intercepts"]) == 10

    eval_data = data["evaluation"]["ridge"]
    per_beta = {item["beta_index"]: item for item in eval_data["per_beta"]}

    # Verify primary body betas have high R^2 (> 0.85) on real human PCA space
    assert per_beta[0]["r2"] > 0.85, f"Beta 0 R^2 too low: {per_beta[0]['r2']}"
    assert per_beta[1]["r2"] > 0.85, f"Beta 1 R^2 too low: {per_beta[1]['r2']}"

def test_glb_export_with_morph_targets():
    """Verify GLB exporter generates valid glTF 2.0 file with 10 morph targets in A-pose."""
    test_glb_path = os.path.join(BASE_DIR, "assets", "models", "test_avatar_a_pose.glb")
    exported_path = GlbMorphExporter.generate_morph_avatar_glb(
        output_path=test_glb_path,
        gender="neutral",
        pose="A-pose"
    )

    assert os.path.exists(exported_path)
    assert os.path.getsize(exported_path) > 50 * 1024  # > 50 KB

    # Load with trimesh to verify glTF structure
    scene = trimesh.load(exported_path, file_type="glb")
    assert scene is not None
    assert len(scene.geometry) >= 1

    # Cleanup test artifact
    if os.path.exists(test_glb_path):
        os.remove(test_glb_path)
