import os
import sys
import json
import logging
import numpy as np
import trimesh

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from core.body_model import BodyModel
from core.garment_draper import GarmentDraper
from core.skinning_transfer import SkinningTransfer

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("build_garment_assets")

PRODUCTS_DIR = os.path.join(BASE_DIR, "assets", "products")
BACKEND_GARMENTS_DIR = os.path.join(BASE_DIR, "assets", "garments")
FRONTEND_GARMENTS_DIR = os.path.normpath(
    os.path.join(BASE_DIR, "..", "..", "frontend", "fashion-ai-web", "public", "assets", "garments")
)
os.makedirs(BACKEND_GARMENTS_DIR, exist_ok=True)
os.makedirs(FRONTEND_GARMENTS_DIR, exist_ok=True)

def main():
    print("=" * 70)
    print("   SMARTFIT PHASE 4: 3D GARMENT DRAPING & RIGGING PIPELINE")
    print("=" * 70)

    # 1. Load Body Models
    model_female = BodyModel(gender="female")
    mesh_female = model_female.get_trimesh([0.0] * 10, pose="a_pose")

    model_male = BodyModel(gender="male")
    mesh_male = model_male.get_trimesh([0.0] * 10, pose="a_pose")

    # 1m80 Tall avatar mesh (beta_0 tall)
    mesh_tall_180 = model_male.get_trimesh([1.5] + [0.0] * 9, pose="a_pose")

    # 2. Process Sample Products
    products = []
    for fn in ["prod_tshirt_cotton.json", "prod_cardigan_knit.json"]:
        p_path = os.path.join(PRODUCTS_DIR, fn)
        if os.path.exists(p_path):
            with open(p_path, "r", encoding="utf-8") as f:
                products.append(json.load(f))

    for p in products:
        p_id = p["product_id"]
        p_name = p["name"]
        print(f"\n--> Processing Product: {p_name} ({p_id})...")

        for size in ["XS", "S", "M", "L", "XL", "XXL"]:
            size_clean = size.lower()
            print(f"  [+] Draping Size {size}...")

            # Drape on male/female
            g_mesh, ease_info, _ = GarmentDraper.drape_garment(
                body_mesh=mesh_female if "cardigan" in p_id else mesh_male,
                product_spec=p,
                size=size,
                color_hex=p.get("color_hex")
            )

            # Rig and export Skinned GLB
            out_fn = f"{p_id}_{size_clean}.glb"
            b_path = os.path.join(BACKEND_GARMENTS_DIR, out_fn)
            f_path = os.path.join(FRONTEND_GARMENTS_DIR, out_fn)

            SkinningTransfer.export_skinned_garment_glb(
                garment_mesh=g_mesh,
                output_glb_path=b_path,
                gender="female" if "cardigan" in p_id else "male",
                garment_name=f"{p_name} ({size})"
            )
            # Copy to frontend
            import shutil
            shutil.copy2(b_path, f_path)

            # If default t-shirt, also maintain legacy fitted_{size}.glb naming for try-on-page compatibility
            if p_id == "prod_tshirt_cotton":
                shutil.copy2(b_path, os.path.join(BACKEND_GARMENTS_DIR, f"fitted_{size_clean}.glb"))
                shutil.copy2(b_path, os.path.join(FRONTEND_GARMENTS_DIR, f"fitted_{size_clean}.glb"))

            # Log measurement accuracy
            meas = ease_info["mesh_measurements"]
            target = ease_info["target_specs"]
            dev_chest = abs(meas["chest_width_cm"] - target["chest_width_cm"])
            dev_len = abs(meas["body_length_cm"] - target["body_length_cm"])
            print(f"      Size {size}: Chest Width={meas['chest_width_cm']}cm (Target={target['chest_width_cm']}cm, err={dev_chest:.2f}cm), Length={meas['body_length_cm']}cm (Target={target['body_length_cm']}cm, err={dev_len:.2f}cm)")

    # 3. Drape 1m80 Avatar wearing Size S (Tight fitting demonstration)
    print("\n--> Draping 1m80 Tall Avatar in Size S (Tension Demonstration)...")
    ts_spec = products[0]
    g_mesh_s_180, ease_s_180, _ = GarmentDraper.drape_garment(
        body_mesh=mesh_tall_180,
        product_spec=ts_spec,
        size="S",
        color_hex="#19284B"
    )
    out_180_b = os.path.join(BACKEND_GARMENTS_DIR, "fitted_s_180.glb")
    out_180_f = os.path.join(FRONTEND_GARMENTS_DIR, "fitted_s_180.glb")
    SkinningTransfer.export_skinned_garment_glb(
        garment_mesh=g_mesh_s_180,
        output_glb_path=out_180_b,
        gender="male",
        garment_name="T-Shirt Size S on 1m80"
    )
    import shutil
    shutil.copy2(out_180_b, out_180_f)
    print(f"  [+] Generated fitted_s_180.glb (Ease={ease_s_180['ease_chest_cm']}cm, Tight={ease_s_180['is_tight']})")

    print("\n" + "=" * 70)
    print("   PHASE 4 GARMENT PIPELINE COMPLETED SUCCESSFULLY")
    print("=" * 70)

if __name__ == "__main__":
    main()
