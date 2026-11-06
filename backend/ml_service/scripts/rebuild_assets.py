import os
import sys
import shutil
import json
import logging

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.body_model import BodyModel
from core.slider_mapping import SliderMappingEngine
from core.export_glb import GlbMorphExporter

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("rebuild_assets")

def rebuild_all_assets(num_samples: int = 1000):
    print("\n" + "=" * 75)
    print("   FASHION AI: UNIFIED ASSET REBUILD PIPELINE")
    print("=" * 75)

    # 1. Inspect SMPL / SMPL-X directory status
    smpl_dir = os.path.join(BASE_DIR, "assets", "smpl")
    smplx_dir = os.path.join(BASE_DIR, "assets", "smplx")
    available_weights = []
    for d in [smpl_dir, smplx_dir]:
        if os.path.exists(d):
            available_weights.extend([f for f in os.listdir(d) if f.endswith((".npz", ".pkl"))])

    bm_probe = BodyModel()
    print(f"\n[1/5] Checking model weights in assets...")
    if not bm_probe.is_mock:
        print(f"  --> FOUND OFFICIAL WEIGHTS: {list(set(available_weights))}")
        print(f"  --> Active Parametric Model: {bm_probe.model_type.upper()} ({bm_probe.num_vertices} vertices, {bm_probe.num_faces} faces)")
    else:
        print("  --> [MOCK MODE] No official weights found. Running with canonical mock mesh.")

    # 2. Generate Synthetic Dataset & Train Regression
    print(f"\n[2/5] Generating {num_samples} synthetic body samples & training regression...")
    engine = SliderMappingEngine(assets_dir=os.path.join(BASE_DIR, "assets"))
    X, Y = engine.generate_synthetic_dataset(num_samples=num_samples)
    eval_rep = engine.train_models(X, Y)

    # 3. Export Weights to JSON
    print("\n[3/5] Exporting client-side Ridge regression weights to JSON...")
    weights_dict = engine.export_weights_and_save()

    # 4. Export Morph GLBs for available genders
    print("\n[4/5] Exporting Canonical A-Pose 3D GLB Models with 10 Morph Targets...")
    models_dir = os.path.join(BASE_DIR, "assets", "models")
    os.makedirs(models_dir, exist_ok=True)

    genders = ["neutral"]
    if any("male" in f.lower() for f in available_weights):
        genders.append("male")
    if any("female" in f.lower() for f in available_weights):
        genders.append("female")

    exported_files = []
    for g in genders:
        out_name = f"human_avatar_a_pose_{g}.glb" if g != "neutral" else "human_avatar_a_pose.glb"
        out_path = os.path.join(models_dir, out_name)
        GlbMorphExporter.generate_morph_avatar_glb(output_path=out_path, gender=g, pose="A-pose")
        exported_files.append((g, out_path))

    # 5. Export Parametric Fitted Garment GLBs (S, M, L, XL)
    print("\n[5/6] Exporting Parametric Fitted Garment GLBs (S, M, L, XL)...")
    from core.garment import GarmentGenerator
    bm = BodyModel()
    base_body = bm.get_trimesh(betas=[0.0] * 10, pose="a_pose")
    gen = GarmentGenerator()

    frontend_dir = os.path.normpath(os.path.join(BASE_DIR, "..", "..", "frontend", "fashion-ai-web", "public", "assets"))
    garments_dir = os.path.join(BASE_DIR, "assets", "garments")
    os.makedirs(garments_dir, exist_ok=True)
    frontend_garments_dir = os.path.join(frontend_dir, "garments")
    os.makedirs(frontend_garments_dir, exist_ok=True)

    for sz in ["S", "M", "L", "XL"]:
        g_mesh, ease = gen.generate_tshirt(base_body, size=sz, color_hex="#19284B", drape_mode="pushout")
        out_g_path = os.path.join(garments_dir, f"fitted_{sz.lower()}.glb")
        g_mesh.export(out_g_path, file_type="glb")
        shutil.copy2(out_g_path, os.path.join(frontend_garments_dir, f"fitted_{sz.lower()}.glb"))
        print(f"  --> Exported & copied 'fitted_{sz.lower()}.glb' (Chest ease: {ease['ease_chest_cm']} cm)")

    # Also export 180cm stature with size S
    tall_body = bm.get_trimesh(betas=[0.0, 1.6, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], pose="a_pose")
    g_s_180, ease_180 = gen.generate_tshirt(tall_body, size="S", color_hex="#19284B", drape_mode="pushout")
    out_180_path = os.path.join(garments_dir, "fitted_s_180.glb")
    g_s_180.export(out_180_path, file_type="glb")
    shutil.copy2(out_180_path, os.path.join(frontend_garments_dir, "fitted_s_180.glb"))
    print(f"  --> Exported & copied 'fitted_s_180.glb' for tall stature (180cm, Chest ease: {ease_180['ease_chest_cm']} cm)")

    # 6. Copy to Frontend Public Assets
    print("\n[6/6] Deploying generated assets to Frontend (public/assets)...")
    frontend_data_dir = os.path.join(frontend_dir, "data")
    frontend_models_dir = os.path.join(frontend_dir, "models")
    os.makedirs(frontend_data_dir, exist_ok=True)
    os.makedirs(frontend_models_dir, exist_ok=True)

    # Copy JSON weights
    shutil.copy2(engine.weights_json_path, os.path.join(frontend_data_dir, "slider_mapping_weights.json"))
    print(f"  --> Copied 'slider_mapping_weights.json' -> {frontend_data_dir}")

    # Copy GLBs
    for g, src_path in exported_files:
        dest_path = os.path.join(frontend_models_dir, os.path.basename(src_path))
        shutil.copy2(src_path, dest_path)
        print(f"  --> Copied '{os.path.basename(src_path)}' -> {frontend_models_dir}")
        if g == "neutral":
            shutil.copy2(src_path, os.path.join(frontend_models_dir, "base_avatar.glb"))
            print(f"  --> Updated 'base_avatar.glb' default fallback.")

    # Final Comprehensive Report on ALL 10 Betas
    print("\n" + "=" * 75)
    print("   EVALUATION REPORT: ALL 10 SMPL-X SHAPE BETAS (Ridge vs MLP)")
    print("=" * 75)
    beta_meanings = [
        "Overall Mass / BMI",
        "Stature / Height Elongation",
        "Chest Girth / V-Taper Athletic Ratio",
        "Waist Depth / Abdominal Thickness",
        "Pelvic & Hip Breadth",
        "Across Shoulder Breadth",
        "Upper Arm Mass / Muscle",
        "Torso-to-Leg Ratio",
        "Head & Neck Frame",
        "Secondary Anatomical Variance"
    ]

    ridge_items = eval_rep["ridge"]["per_beta"]
    mlp_items = eval_rep["mlp"]["per_beta"]

    print(f"{'Beta':<6} | {'Anatomical Description':<38} | {'Ridge R²':<10} | {'Ridge MAE':<10} | {'MLP R²':<10}")
    print("-" * 85)
    for i in range(10):
        r_r2 = ridge_items[i]["r2"]
        r_mae = ridge_items[i]["mae"]
        m_r2 = mlp_items[i]["r2"]
        print(f"b_{i:<4} | {beta_meanings[i]:<38} | {r_r2:<10.4f} | {r_mae:<10.4f} | {m_r2:<10.4f}")

    print("-" * 85)
    print(f"Overall Ridge: R² = {eval_rep['ridge']['overall_r2']:.4f}, MAE = {eval_rep['ridge']['overall_mae']:.4f}")
    print(f"Overall MLP:   R² = {eval_rep['mlp']['overall_r2']:.4f}, MAE = {eval_rep['mlp']['overall_mae']:.4f}")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    rebuild_all_assets()
