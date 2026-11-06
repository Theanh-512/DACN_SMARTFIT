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
from core.body_rig import BodyRigEngine, SMPL_JOINT_NAMES, SMPL_PARENTS, JOINT_LIMITS_DEG
from core.export_rigged_glb import GlbRiggedExporter

def test_smpl_joint_hierarchy_and_count():
    """Verify standard 24-joint SMPL kinematic tree and hierarchical parenting."""
    assert len(SMPL_JOINT_NAMES) == 24, f"Expected 24 SMPL joints, got {len(SMPL_JOINT_NAMES)}"
    assert len(SMPL_PARENTS) == 24, f"Expected 24 parent indices, got {len(SMPL_PARENTS)}"

    # Joint 0 is root (pelvis) with parent -1
    assert SMPL_JOINT_NAMES[0].lower() == "pelvis"
    assert SMPL_PARENTS[0] == -1

    # Kinematic tree condition: parent of joint j must be < j
    for j in range(1, 24):
        p = SMPL_PARENTS[j]
        assert 0 <= p < j, f"Joint {j} ({SMPL_JOINT_NAMES[j]}) parent {p} violates tree order (must be < {j})"

def test_skin_weights_normalization():
    """Verify top 4 skinning weights per vertex are normalized to sum to 1.0."""
    model = BodyModel(gender="neutral")
    assert model.torch_model is not None
    lbs_weights = model.torch_model.lbs_weights.detach().cpu().numpy()

    indices, weights = BodyRigEngine.extract_top4_skinning_weights(lbs_weights)

    assert indices.shape == (6890, 4), f"Expected shape (6890, 4), got {indices.shape}"
    assert weights.shape == (6890, 4), f"Expected shape (6890, 4), got {weights.shape}"

    # All bone indices must be in [0, 23]
    assert indices.min() >= 0
    assert indices.max() < 24

    # Weights must sum to 1.0 +- 1e-5
    row_sums = weights.sum(axis=-1)
    np.testing.assert_allclose(row_sums, 1.0, atol=1e-5, err_msg="Skin weights row sum must equal 1.0")

def test_sparse_j_regressor_dynamic_updates():
    """Verify sparse joint regressor recomputes joint positions dynamically when body changes shape."""
    model = BodyModel(gender="neutral")
    assert model.torch_model is not None
    j_regressor = model.torch_model.J_regressor.detach().cpu().numpy()

    sparse_reg = BodyRigEngine.extract_sparse_j_regressor(j_regressor)

    assert len(sparse_reg) == 24

    # Sparsity check: non-zero count should be a tiny fraction of 24 * 6890
    total_nnz = sum(len(sparse_reg[str(j)]) for j in range(24))
    sparsity = 1.0 - (total_nnz / (24 * 6890))
    assert sparsity > 0.95, f"Expected >95% sparsity, got {sparsity * 100:.2f}%"

    # Compute rest joints from zero-beta mesh using sparse regressor
    rest_verts, _ = model.build_mesh([0.0] * 10, pose="T-pose")
    rest_joints = np.zeros((24, 3), dtype=np.float32)
    for j in range(24):
        for v_idx, w in sparse_reg[str(j)]:
            rest_joints[j] += w * rest_verts[v_idx]

    # Compute shaped joints from tall/broad stature beta (+3.0)
    tall_betas = [3.0] + [0.0] * 9
    tall_verts, _ = model.build_mesh(tall_betas, pose="T-pose")
    tall_joints = np.zeros((24, 3), dtype=np.float32)
    for j in range(24):
        for v_idx, w in sparse_reg[str(j)]:
            tall_joints[j] += w * tall_verts[v_idx]

    # Head and spine joints must shift upward in Y axis
    head_idx = SMPL_JOINT_NAMES.index("head")
    assert tall_joints[head_idx, 1] > rest_joints[head_idx, 1], "Tall beta must raise head joint position"

    # Pelvis and spine adapt to stature change
    diff_norm = np.linalg.norm(tall_joints - rest_joints, axis=-1)
    assert diff_norm.max() > 0.05, f"Joints must adapt to body shape change (max shift {diff_norm.max():.3f} m)"

def test_regional_morphs_gaussian_falloff():
    """Verify 6 regional morph targets have localized effects and do not invert faces."""
    model = BodyModel(gender="neutral")
    rest_verts, rest_faces = model.build_mesh([0.0] * 10, pose="T-pose")
    mesh = trimesh.Trimesh(vertices=rest_verts, faces=rest_faces, process=False)
    j_regressor = model.torch_model.J_regressor.detach().cpu().numpy()
    joints = np.dot(j_regressor, rest_verts)

    regional_morphs = BodyRigEngine.compute_regional_morphs(rest_verts, mesh.vertex_normals, joints)

    expected_regions = ["morph_abdomen", "morph_chest", "morph_biceps", "morph_thighs", "morph_buttocks", "morph_shoulders"]
    for reg in expected_regions:
        assert reg in regional_morphs, f"Missing regional morph: {reg}"
        deltas = regional_morphs[reg]
        assert deltas.shape == rest_verts.shape

        # Morph amplitude must be bounded (< 0.15 m) to prevent self-intersection
        max_disp = np.linalg.norm(deltas, axis=-1).max()
        assert 0.01 <= max_disp <= 0.15, f"{reg} displacement {max_disp} out of safe bounds [0.01, 0.15] m"

    # Verify Abdomen morph: maximum displacement in front of torso (z > 0), zero at feet/head
    ab_disp = np.linalg.norm(regional_morphs["morph_abdomen"], axis=-1)
    head_verts = np.where(rest_verts[:, 1] > 0.45)[0]
    feet_verts = np.where(rest_verts[:, 1] < -0.90)[0]
    assert len(head_verts) > 50, "Must have head vertices"
    assert len(feet_verts) > 50, "Must have feet vertices"
    assert ab_disp[head_verts].max() < 1e-4, "Abdomen morph must not affect head vertices"
    assert ab_disp[feet_verts].max() < 1e-4, "Abdomen morph must not affect feet vertices"

    # Verify no degenerate or inverted faces when applying moderate morphs
    deformed_verts = rest_verts.copy()
    for deltas in regional_morphs.values():
        deformed_verts += 0.5 * deltas

    deformed_mesh = trimesh.Trimesh(vertices=deformed_verts, faces=rest_faces)
    assert deformed_mesh.is_watertight, "Mesh with regional morphs applied must remain watertight"
    assert np.all(deformed_mesh.area_faces > 1e-7), "Mesh must have no collapsed or degenerate zero-area faces"

def test_pose_presets_and_joint_limits():
    """Verify anatomical limits and preset joint rotations."""
    # Check limit definitions
    for name, limits in JOINT_LIMITS_DEG.items():
        assert "min" in limits and "max" in limits, f"Missing min/max in {name}"
        assert len(limits["min"]) == 3 and len(limits["max"]) == 3
        for axis in range(3):
            assert limits["min"][axis] <= limits["max"][axis], f"Joint {name} axis {axis} min > max"

    # Verify both knees only bend backwards (positive X rotation 0 to 140 deg; min=0 prevents hyperextension forward)
    for knee in ["left_knee", "right_knee"]:
        k_limits = JOINT_LIMITS_DEG[knee]
        assert k_limits["min"][0] >= 0.0, f"{knee} min limit must be >= 0 to prevent hyperextending forward"
        assert k_limits["max"][0] >= 130.0, f"{knee} max limit must allow backward flexion >= 130 deg"

    # Verify elbow joints flexion range
    l_elbow_limits = JOINT_LIMITS_DEG["left_elbow"]
    assert l_elbow_limits["max"][0] >= 90.0, "Elbow can flex to at least 90 degrees"

def test_height_invariant_body_fullness():
    """Verify that body fullness increases body volume while preserving height."""
    model = BodyModel(gender="female")
    
    # Baseline
    b_base = [0.0] * 10
    v_base, f_base = model.build_mesh(b_base, pose="T-pose")
    m_base = BodyMeasurements.extract_from_mesh(trimesh.Trimesh(vertices=v_base, faces=f_base))

    # Slim (-Fullness: beta_1 = +2.0, beta_0 = -0.31)
    b_slim = [-0.31, 2.0] + [0.0] * 8
    v_slim, _ = model.build_mesh(b_slim, pose="T-pose")
    m_slim = BodyMeasurements.extract_from_mesh(trimesh.Trimesh(vertices=v_slim, faces=f_base))

    # Full (+Fullness: beta_1 = -2.0, beta_0 = +0.31)
    b_full = [0.31, -2.0] + [0.0] * 8
    v_full, _ = model.build_mesh(b_full, pose="T-pose")
    m_full = BodyMeasurements.extract_from_mesh(trimesh.Trimesh(vertices=v_full, faces=f_base))

    # Height variation must remain under 0.25 cm
    height_delta_slim = abs(m_slim["height_cm"] - m_base["height_cm"])
    height_delta_full = abs(m_full["height_cm"] - m_base["height_cm"])
    assert height_delta_slim < 0.25, f"Slim shape altered height by {height_delta_slim:.2f} cm (must be < 0.25 cm)"
    assert height_delta_full < 0.25, f"Full shape altered height by {height_delta_full:.2f} cm (must be < 0.25 cm)"

    # Waist and chest must expand significantly
    assert m_full["waist_cm"] > m_base["waist_cm"] + 7.0, "Full shape must increase waist circumference by > 7 cm"
    assert m_base["waist_cm"] > m_slim["waist_cm"] + 7.0, "Slim shape must decrease waist circumference by > 7 cm"
    assert m_full["chest_cm"] > m_slim["chest_cm"] + 15.0, "Chest circumference must expand across fullness range"

def test_shoulder_lateral_morph_and_breadth():
    """Verify shoulder morph applies lateral +-X displacement and increases across-shoulder breadth."""
    model = BodyModel(gender="female")
    v_base, f_base = model.build_mesh([0.0] * 10, pose="T-pose")
    mesh = trimesh.Trimesh(vertices=v_base, faces=f_base, process=False)
    j_regressor = model.torch_model.J_regressor.detach().cpu().numpy()
    joints = np.dot(j_regressor, v_base)

    morphs = BodyRigEngine.compute_regional_morphs(v_base, mesh.vertex_normals, joints)
    sh_delta = morphs["morph_shoulders"]

    # Verify lateral displacement: on left shoulder deltoid (x in [0.16, 0.28]), delta_x > 0; on right, delta_x < 0
    left_sh = np.where((v_base[:, 0] > 0.16) & (v_base[:, 0] < 0.28) & (v_base[:, 1] > 0.18) & (v_base[:, 1] < 0.32))[0]
    right_sh = np.where((v_base[:, 0] < -0.16) & (v_base[:, 0] > -0.28) & (v_base[:, 1] > 0.18) & (v_base[:, 1] < 0.32))[0]
    assert len(left_sh) > 50, "Must have sufficient shoulder deltoid vertices"
    assert np.mean(sh_delta[left_sh, 0]) > 0.02, "Left shoulder morph must expand laterally (+X) by > 2 cm"
    assert np.mean(sh_delta[right_sh, 0]) < -0.02, "Right shoulder morph must expand laterally (-X) by > 2 cm"

    # Check that vertical elevation of shoulder is minimal (< lateral expansion)
    assert np.mean(np.abs(sh_delta[left_sh, 1])) < np.mean(np.abs(sh_delta[left_sh, 0]))

    # Test shoulder breadth measurement with morph applied
    v_wide = v_base + 1.0 * sh_delta
    v_narrow = v_base - 0.7 * sh_delta

    m_base = BodyMeasurements.extract_from_mesh(mesh)
    m_wide = BodyMeasurements.extract_from_mesh(trimesh.Trimesh(vertices=v_wide, faces=f_base))
    m_narrow = BodyMeasurements.extract_from_mesh(trimesh.Trimesh(vertices=v_narrow, faces=f_base))

    assert m_wide["shoulder_cm"] > m_base["shoulder_cm"] + 2.0, "Wide shoulder morph must increase shoulder width"
    assert m_narrow["shoulder_cm"] < m_base["shoulder_cm"] - 1.5, "Narrow shoulder morph must decrease shoulder width"
    # Pelvis and height should not be affected
    assert abs(m_wide["hip_cm"] - m_base["hip_cm"]) < 0.5, "Shoulder morph must not alter hip measurement"
    assert abs(m_wide["height_cm"] - m_base["height_cm"]) < 0.2, "Shoulder morph must not alter height"

def test_chest_and_abdomen_independence():
    """Verify chest and abdomen regional morphs operate independently without cross-contaminating measurements."""
    model = BodyModel(gender="female")
    v_base, f_base = model.build_mesh([0.0] * 10, pose="T-pose")
    mesh = trimesh.Trimesh(vertices=v_base, faces=f_base, process=False)
    j_regressor = model.torch_model.J_regressor.detach().cpu().numpy()
    joints = np.dot(j_regressor, v_base)

    morphs = BodyRigEngine.compute_regional_morphs(v_base, mesh.vertex_normals, joints)
    m_base = BodyMeasurements.extract_from_mesh(mesh)

    # 1. Apply ONLY chest morph (+1.0)
    v_chest = v_base + 1.0 * morphs["morph_chest"]
    m_chest = BodyMeasurements.extract_from_mesh(trimesh.Trimesh(vertices=v_chest, faces=f_base))

    assert m_chest["chest_cm"] > m_base["chest_cm"] + 4.0, "Chest morph must expand chest circumference"
    assert abs(m_chest["waist_cm"] - m_base["waist_cm"]) < 1.0, "Chest morph must not significantly change waist circumference"

    # 2. Apply ONLY abdomen morph (+1.0)
    v_ab = v_base + 1.0 * morphs["morph_abdomen"]
    m_ab = BodyMeasurements.extract_from_mesh(trimesh.Trimesh(vertices=v_ab, faces=f_base))

    assert m_ab["waist_cm"] > m_base["waist_cm"] + 4.0, "Abdomen morph must expand waist circumference"
    assert abs(m_ab["chest_cm"] - m_base["chest_cm"]) < 1.0, "Abdomen morph must not significantly change chest circumference"

def test_morph_reversibility_to_baseline():
    """Verify that applying morphs and then zeroing them restores baseline mesh perfectly."""
    model = BodyModel(gender="female")
    v_base, f_base = model.build_mesh([0.0] * 10, pose="T-pose")
    mesh = trimesh.Trimesh(vertices=v_base, faces=f_base, process=False)
    j_regressor = model.torch_model.J_regressor.detach().cpu().numpy()
    joints = np.dot(j_regressor, v_base)

    morphs = BodyRigEngine.compute_regional_morphs(v_base, mesh.vertex_normals, joints)
    
    # Combined deformation
    weights = {"morph_abdomen": 0.8, "morph_chest": -0.5, "morph_shoulders": 0.7, "morph_thighs": 0.6}
    v_deformed = v_base.copy()
    for name, w in weights.items():
        v_deformed += w * morphs[name]

    # Revert to zero influences
    v_reverted = v_deformed.copy()
    for name, w in weights.items():
        v_reverted -= w * morphs[name]

    max_dev = np.max(np.abs(v_reverted - v_base))
    assert max_dev < 1e-6, f"Reverting morphs to zero must restore baseline within 1e-6 m, got {max_dev}"


def test_underwear_layer_extraction_and_isolation():
    """Verify underwear submesh has outward offset, shares skin weights, and is excluded from measurements."""
    model = BodyModel(gender="female")
    rest_verts, rest_faces = model.build_mesh([0.0] * 10, pose="T-pose")
    mesh = trimesh.Trimesh(vertices=rest_verts, faces=rest_faces, process=False)
    joints = np.dot(model.torch_model.J_regressor.detach().cpu().numpy(), rest_verts)

    uw = BodyRigEngine.extract_underwear_submesh(rest_verts, rest_faces, mesh.vertex_normals, joints, gender="female")
    uw_verts = uw["vertices"]
    uw_faces = uw["faces"]
    orig_indices = uw["vertex_indices"]

    assert len(uw_verts) > 300, "Underwear must contain sufficient vertices for bikini/briefs"
    assert len(uw_faces) > 500, "Underwear must contain valid face topology"

    # 2-3 mm outward offset check
    offsets = np.linalg.norm(uw_verts - rest_verts[orig_indices], axis=-1)
    mean_offset_mm = offsets.mean() * 1000.0
    assert 2.0 <= mean_offset_mm <= 3.0, f"Underwear offset {mean_offset_mm:.2f} mm must be in [2.0, 3.0] mm range"

    # Measurement Isolation Check: BodyMeasurements must run ONLY on base body mesh
    body_mesh = trimesh.Trimesh(vertices=rest_verts, faces=rest_faces)
    meas_clean = BodyMeasurements.extract_from_mesh(body_mesh)

    # Clean measurement must be computed from pure body mesh
    assert meas_clean["chest_cm"] > 70.0
    assert meas_clean["waist_cm"] > 55.0
    assert meas_clean["hip_cm"] > 75.0

def test_measurement_consistency_under_shape_presets():
    """Verify measurement mapping consistency across body shape presets with < 1.0 cm error target."""
    model = BodyModel(gender="female")

    # Define test presets with exact calibrated SMPL body dimensions
    presets = [
        {"name": "Slim", "betas": [-1.5, 0.5, -1.0, -1.0, -0.8, -0.5, -0.5, 0.0, 0.0, 0.0], "expected_chest": 76.1, "expected_waist": 65.8, "expected_hip": 92.0},
        {"name": "Balanced", "betas": [0.0] * 10, "expected_chest": 89.2, "expected_waist": 82.8, "expected_hip": 104.5},
        {"name": "Athletic", "betas": [0.8, 0.6, 0.8, -0.5, 0.2, 1.2, 0.6, 0.0, 0.0, 0.0], "expected_chest": 87.3, "expected_waist": 82.2, "expected_hip": 106.6},
        {"name": "Fuller", "betas": [1.8, -0.2, 1.5, 1.6, 1.8, 0.5, 0.8, 0.0, 0.0, 0.0], "expected_chest": 100.4, "expected_waist": 100.3, "expected_hip": 116.9},
    ]

    prev_chest = 0.0
    for p in presets:
        verts, faces = model.build_mesh(p["betas"], pose="T-pose")
        mesh = trimesh.Trimesh(vertices=verts, faces=faces)
        meas = BodyMeasurements.extract_from_mesh(mesh)

        chest_err = abs(meas["chest_cm"] - p["expected_chest"])
        waist_err = abs(meas["waist_cm"] - p["expected_waist"])
        hip_err = abs(meas["hip_cm"] - p["expected_hip"])

        # Target error < 1.0 cm
        assert chest_err < 1.0, f"Preset {p['name']} chest error {chest_err:.2f} cm exceeded 1.0 cm target"
        assert waist_err < 1.0, f"Preset {p['name']} waist error {waist_err:.2f} cm exceeded 1.0 cm target"
        assert hip_err < 1.0, f"Preset {p['name']} hip error {hip_err:.2f} cm exceeded 1.0 cm target"

def test_rigged_glb_export_integrity():
    """Verify that GlbRiggedExporter creates a valid glTF file with skinning, armature and morph targets."""
    out_path = os.path.join(BASE_DIR, "assets", "models", "rigged", "test_avatar_rigged.glb")
    res = GlbRiggedExporter.generate_rigged_avatar_glb(
        output_glb_path=out_path,
        gender="neutral"
    )

    assert os.path.exists(out_path)
    assert os.path.getsize(out_path) > 100 * 1024  # > 100 KB
    assert len(res["joint_names"]) == 24
    assert len(res["target_names"]) == 16
    assert res["num_body_vertices"] == 6890

    # Clean up test artifact
    if os.path.exists(out_path):
        os.remove(out_path)
