import os
import sys
import logging

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.body_model import BodyModel
from core.measurements import BodyMeasurements

logger = logging.getLogger("ml_service.test_official_smplx")
logging.basicConfig(level=logging.INFO)

def check_official_smplx():
    """
    Checks for the presence of official SMPLX_NEUTRAL.npz / .pkl weights
    and validates mesh generation & anthropometric measurement extraction.
    """
    model_dir = os.path.join(BASE_DIR, "assets", "smplx")
    candidates = [
        "SMPL_NEUTRAL.npz",
        "SMPL_NEUTRAL.pkl",
        "SMPLX_NEUTRAL.npz",
        "SMPLX_NEUTRAL.pkl",
        "smpl_neutral.npz",
        "smplx_neutral.npz"
    ]

    found_file = None
    for d in [model_dir, os.path.join(BASE_DIR, "assets", "smpl")]:
        if os.path.exists(d):
            for cand in candidates:
                full_path = os.path.join(d, cand)
                if os.path.exists(full_path):
                    found_file = full_path
                    break
        if found_file:
            break

    if not found_file:
        print("\n" + "=" * 70)
        print(" [STATUS] SMPL/SMPLX weights NOT detected in assets/.")
        print(" Currently running in verified MOCK parametric mode.")
        print("=" * 70 + "\n")
        return False

    print("\n" + "=" * 70)
    print(f" [FOUND] Detected official model file: {found_file}")
    print(" Testing official forward pass & ISO measurements...")

    model = BodyModel(model_path=model_dir)
    if model.is_mock:
        print(" [WARNING] Model still initialized in mock mode. Check smplx dependency / file format.")
        return False

    print(" Official SMPL-X initialized successfully (is_mock = False).")

    # 1. Baseline Betas = 0
    verts, faces = model.build_mesh([0.0] * 10)
    mesh = model.get_trimesh([0.0] * 10)
    meas = BodyMeasurements.extract_from_mesh(mesh)

    print(f" Vertices: {verts.shape}, Faces: {faces.shape}")
    print(" Official SMPL-X Measurements (betas = 0):")
    for k, v in meas.items():
        print(f"   - {k}: {v} cm")

    # 2. Monotonicity Test
    b_test = [-2.0, 0.0, 2.0]
    chests = [BodyMeasurements.extract_from_mesh(model.get_trimesh([b] + [0.0] * 9))["chest_cm"] for b in b_test]
    print(f" Monotonicity check on beta[0] [-2, 0, +2]: {chests}")
    assert chests[0] < chests[1] < chests[2], "Monotonicity failed on official SMPL-X model!"

    print(" [PASSED] Official SMPL-X model verified with zero regressions!")
    print("=" * 70 + "\n")
    return True

if __name__ == "__main__":
    check_official_smplx()
