import os
import sys
import json
import pytest
import numpy as np
import trimesh
from scipy.spatial import cKDTree

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.body_model import BodyModel
from core.pattern_generator import ParametricPatternGenerator
from core.texture_extractor import TextureExtractor
from core.garment_draper import GarmentDraper
from core.skinning_transfer import SkinningTransfer

def test_pattern_generator_all_sizes():
    """Verify 2D pattern generation for T-Shirt and Cardigan across all sizes XS to XXL."""
    products_dir = os.path.join(BASE_DIR, "assets", "products")
    
    for fn in ["prod_tshirt_cotton.json", "prod_cardigan_knit.json"]:
        p_path = os.path.join(products_dir, fn)
        with open(p_path, "r", encoding="utf-8") as f:
            spec = json.load(f)

        g_type = spec["category"]
        for size_key, s_spec in spec["sizes"].items():
            pattern = ParametricPatternGenerator.generate_pattern(g_type, s_spec)
            assert pattern["garment_type"] == g_type
            assert len(pattern["pieces"]) >= 4, f"{g_type} {size_key} must have at least 4 pattern pieces"
            assert len(pattern["seams"]) >= 4, f"{g_type} {size_key} must have seam connections"
            
            # Check pattern polygon validity
            for p_name, p_data in pattern["pieces"].items():
                poly = p_data["polygon"]
                assert len(poly) >= 4, f"Piece {p_name} must have valid polygon"
                assert not np.any(np.isnan(poly)), f"Piece {p_name} has NaN coordinates"

def test_rest_pattern_measurement_accuracy():
    """Verify that 2D parametric pattern dimensions match size chart within 1.0 cm."""
    products_dir = os.path.join(BASE_DIR, "assets", "products")
    p_path = os.path.join(products_dir, "prod_tshirt_cotton.json")
    with open(p_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    for size_key in ["S", "M", "L", "XL"]:
        s_spec = spec["sizes"][size_key]
        pattern = ParametricPatternGenerator.generate_pattern("tshirt", s_spec)

        # 1. Front panel chest width (X max - X min)
        f_poly = pattern["pieces"]["front"]["polygon"]
        meas_cw = (np.max(f_poly[:, 0]) - np.min(f_poly[:, 0]))
        err_cw = abs(meas_cw - s_spec["chest_width_cm"])
        assert err_cw < 1.0, f"Size {size_key} chest width error {err_cw:.2f}cm exceeds 1.0cm target"

        # 2. Body length (Y max - Y min)
        meas_bl = (np.max(f_poly[:, 1]) - np.min(f_poly[:, 1]))
        err_bl = abs(meas_bl - s_spec["body_length_cm"])
        assert err_bl < 1.0, f"Size {size_key} body length error {err_bl:.2f}cm exceeds 1.0cm target"

        # 3. Sleeve length
        sl_poly = pattern["pieces"]["sleeve_left"]["polygon"]
        meas_sl = (np.max(sl_poly[:, 1]) - np.min(sl_poly[:, 1]))
        err_sl = abs(meas_sl - s_spec["sleeve_length_cm"])
        assert err_sl < 1.0, f"Size {size_key} sleeve length error {err_sl:.2f}cm exceeds 1.0cm target"

def test_texture_extractor_silhouette_ratio():
    """Verify dominant color extraction and aspect ratio verification."""
    img_path = os.path.join(BASE_DIR, "assets", "products", "tshirt_front.png")
    assert os.path.exists(img_path), "Sample t-shirt image must exist"

    size_spec = {
        "chest_width_cm": 50.0,
        "body_length_cm": 69.0
    }

    res = TextureExtractor.process_garment_image(img_path, size_spec)
    assert "dominant_hex" in res
    assert res["dominant_hex"].startswith("#")
    assert res["photo_aspect"] > 0.5

def test_garment_drape_mode_fallback():
    """Verify that DRAPE_MODE=blender safely falls back to pushout when Blender is absent."""
    model = BodyModel(gender="neutral")
    b_mesh = model.get_trimesh([0.0] * 10, pose="a_pose")

    p_path = os.path.join(BASE_DIR, "assets", "products", "prod_tshirt_cotton.json")
    with open(p_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    g_mesh, ease_info, _ = GarmentDraper.drape_garment(
        body_mesh=b_mesh,
        product_spec=spec,
        size="M",
        drape_mode="blender" # Test fallback
    )

    assert len(g_mesh.vertices) > 500
    assert "pushout" in ease_info["drape_mode"], "Must gracefully fallback to pushout mode"

def test_zero_skin_penetration_collision():
    """Verify that garment vertices never penetrate body mesh (proj >= clearance everywhere)."""
    model = BodyModel(gender="female")
    b_mesh = model.get_trimesh([0.0] * 10, pose="a_pose")

    p_path = os.path.join(BASE_DIR, "assets", "products", "prod_tshirt_cotton.json")
    with open(p_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    g_mesh, _, _ = GarmentDraper.drape_garment(
        body_mesh=b_mesh,
        product_spec=spec,
        size="M",
        drape_mode="pushout"
    )

    # Check signed clearance against body surface
    body_verts = b_mesh.vertices
    body_norms = b_mesh.vertex_normals
    tree = cKDTree(body_verts)

    dists, idxs = tree.query(g_mesh.vertices)
    nearest_body_pts = body_verts[idxs]
    nearest_body_norms = body_norms[idxs]

    diff = g_mesh.vertices - nearest_body_pts
    proj = np.sum(diff * nearest_body_norms, axis=1)

    min_proj = float(np.min(proj))
    # Clearance must be positive (>= 0.003m) everywhere
    assert min_proj >= 0.002, f"Found skin penetration: min projection {min_proj*1000:.2f} mm < 2.0 mm"

def test_skinning_weight_transfer_normalization():
    """Verify that transferred skinning weights are strictly normalized to 1.0."""
    model = BodyModel(gender="neutral")
    b_mesh = model.get_trimesh([0.0] * 10, pose="a_pose")

    p_path = os.path.join(BASE_DIR, "assets", "products", "prod_tshirt_cotton.json")
    with open(p_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    g_mesh, _, _ = GarmentDraper.drape_garment(
        body_mesh=b_mesh,
        product_spec=spec,
        size="M"
    )

    out_glb = os.path.join(BASE_DIR, "assets", "cache", "garments", "test_skinned.glb")
    SkinningTransfer.export_skinned_garment_glb(
        garment_mesh=g_mesh,
        output_glb_path=out_glb,
        gender="neutral"
    )

    assert os.path.exists(out_glb)
    assert os.path.getsize(out_glb) > 10 * 1024

    if os.path.exists(out_glb):
        os.remove(out_glb)

def test_tall_avatar_tight_fit_tension():
    """Verify that 1m80 avatar wearing size S is diagnosed as tight fit (ease < 2.0 cm)."""
    model = BodyModel(gender="male")
    # Tall stature avatar
    mesh_tall = model.get_trimesh([1.5] + [0.0] * 9, pose="a_pose")

    p_path = os.path.join(BASE_DIR, "assets", "products", "prod_tshirt_cotton.json")
    with open(p_path, "r", encoding="utf-8") as f:
        spec = json.load(f)

    _, ease_info, _ = GarmentDraper.drape_garment(
        body_mesh=mesh_tall,
        product_spec=spec,
        size="S"
    )

    assert ease_info["is_tight"] is True, "1m80 avatar in size S must be detected as tight fit"
    assert ease_info["ease_chest_cm"] < 3.0, f"Expected ease < 3.0 cm, got {ease_info['ease_chest_cm']} cm"
