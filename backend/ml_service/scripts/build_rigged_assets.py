import os
import sys
import shutil
import logging

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.export_rigged_glb import GlbRiggedExporter

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("build_rigged_assets")

def build_all_rigged_assets():
    print("\n" + "=" * 75)
    print("   SMARTFIT PHASE 3.6: RIGGED SMPL AVATAR & UNDERWEAR PIPELINE")
    print("=" * 75)

    backend_rigged_dir = os.path.join(BASE_DIR, "assets", "models", "rigged")
    os.makedirs(backend_rigged_dir, exist_ok=True)

    frontend_dir = os.path.normpath(os.path.join(BASE_DIR, "..", "..", "frontend", "fashion-ai-web", "public", "assets"))
    frontend_models_dir = os.path.join(frontend_dir, "models", "rigged")
    frontend_data_dir = os.path.join(frontend_dir, "data")
    os.makedirs(frontend_models_dir, exist_ok=True)
    os.makedirs(frontend_data_dir, exist_ok=True)

    genders = ["neutral", "female", "male"]
    exported_data = {}

    for g in genders:
        print(f"\n--> Exporting Rigged Avatar ({g})...")
        out_glb = os.path.join(backend_rigged_dir, f"human_avatar_rigged_{g}.glb")
        out_json = os.path.join(backend_rigged_dir, f"smpl_rigged_config_{g}.json")

        payload = GlbRiggedExporter.generate_rigged_avatar_glb(
            output_glb_path=out_glb,
            output_regressor_json_path=out_json,
            gender=g
        )
        exported_data[g] = payload

        # Copy to frontend
        dest_glb = os.path.join(frontend_models_dir, f"human_avatar_rigged_{g}.glb")
        shutil.copy2(out_glb, dest_glb)
        print(f"  --> Copied to '{dest_glb}'")

    # Save primary neutral config for frontend usage
    primary_config = os.path.join(frontend_data_dir, "smpl_rigged_config.json")
    shutil.copy2(os.path.join(backend_rigged_dir, "smpl_rigged_config_neutral.json"), primary_config)
    print(f"  --> Copied primary config to '{primary_config}'")

    print("\n" + "=" * 75)
    print("   PHASE 3.6 RIGGED ASSETS BUILD COMPLETED SUCCESSFULLY")
    print("=" * 75 + "\n")

if __name__ == "__main__":
    build_all_rigged_assets()
