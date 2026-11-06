import os
import sys
import types
import pickle
import argparse
import numpy as np
import scipy.sparse

# Setup shims before unpickling
def setup_chumpy_shim():
    if "chumpy" in sys.modules:
        return
    chumpy = types.ModuleType("chumpy")
    ch_module = types.ModuleType("chumpy.ch")

    class ChObj:
        def __init__(self, *args, **kwargs):
            pass
        def __setstate__(self, state):
            if isinstance(state, dict):
                self.__dict__.update(state)
            elif isinstance(state, tuple):
                self.state = state

    ch_module.Ch = ChObj
    chumpy.ch = ch_module
    sys.modules["chumpy"] = chumpy
    sys.modules["chumpy.ch"] = ch_module

    if "scipy.sparse.csc" not in sys.modules:
        sys.modules["scipy.sparse.csc"] = scipy.sparse


def convert_pkl_to_npz(pkl_path: str, npz_path: str):
    print(f"Reading: {pkl_path}")
    setup_chumpy_shim()

    with open(pkl_path, "rb") as f:
        data = pickle.load(f, encoding="latin1")

    clean_dict = {}

    # 1. v_template
    v_template = np.array(data["v_template"], dtype=np.float32)
    clean_dict["v_template"] = v_template

    # 2. shapedirs
    sd = data["shapedirs"]
    if hasattr(sd, "x"):
        shapedirs = np.array(sd.x, dtype=np.float32)
    elif hasattr(sd, "r"):
        shapedirs = np.array(sd.r, dtype=np.float32)
    else:
        shapedirs = np.array(sd, dtype=np.float32)
    clean_dict["shapedirs"] = shapedirs

    # 3. posedirs
    posedirs = np.array(data["posedirs"], dtype=np.float32)
    clean_dict["posedirs"] = posedirs

    # 4. J_regressor
    jr = data["J_regressor"]
    if hasattr(jr, "toarray"):
        J_regressor = np.array(jr.toarray(), dtype=np.float32)
    else:
        J_regressor = np.array(jr, dtype=np.float32)
    clean_dict["J_regressor"] = J_regressor

    # 5. weights
    weights = np.array(data["weights"], dtype=np.float32)
    clean_dict["weights"] = weights

    # 6. kintree_table
    kintree_table = np.array(data["kintree_table"], dtype=np.int32)
    clean_dict["kintree_table"] = kintree_table

    # 7. faces f
    f_mesh = np.array(data["f"], dtype=np.int32)
    clean_dict["f"] = f_mesh

    os.makedirs(os.path.dirname(os.path.abspath(npz_path)), exist_ok=True)
    np.savez_compressed(npz_path, **clean_dict)

    orig_size_mb = os.path.getsize(pkl_path) / (1024 * 1024)
    new_size_mb = os.path.getsize(npz_path) / (1024 * 1024)
    print(f"  -> Converted: {npz_path}")
    print(f"     Vertices: {v_template.shape}, Faces: {f_mesh.shape}")
    print(f"     Compressed: {orig_size_mb:.1f} MB -> {new_size_mb:.1f} MB ({(1 - new_size_mb/orig_size_mb)*100:.1f}% reduction)")


def main():
    parser = argparse.ArgumentParser(description="Convert official SMPL .pkl models to pure .npz")
    parser.add_argument("--src-dir", type=str, default=None, help="Source directory containing .pkl models")
    parser.add_argument("--dest-dir", type=str, default=None, help="Destination directory for .npz models")
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    workspace_root = os.path.normpath(os.path.join(base_dir, "..", ".."))

    # Default search locations
    src_candidates = [
        args.src_dir,
        os.path.join(workspace_root, "SMPL_python_v.1.1.0", "SMPL_python_v.1.1.0", "smpl", "models"),
        os.path.join(workspace_root, "SMPL_python_v.1.1.0", "smpl", "models"),
        os.path.join(base_dir, "assets", "smpl"),
        os.path.join(base_dir, "assets", "smplx")
    ]
    src_dir = None
    for cand in src_candidates:
        if cand and os.path.isdir(cand):
            pkl_files = [f for f in os.listdir(cand) if f.endswith(".pkl")]
            if pkl_files:
                src_dir = cand
                break

    if not src_dir:
        print("ERROR: Could not locate SMPL .pkl files. Please specify --src-dir.")
        sys.exit(1)

    print(f"Found source SMPL models in: {src_dir}")

    # Destination directories: save to both assets/smpl and assets/smplx for compatibility
    dest_dirs = []
    if args.dest_dir:
        dest_dirs.append(args.dest_dir)
    else:
        dest_dirs.append(os.path.join(base_dir, "assets", "smpl"))
        dest_dirs.append(os.path.join(base_dir, "assets", "smplx"))

    models_map = {
        "female": ["basicmodel_f_lbs_10_207_0_v1.1.0.pkl", "SMPL_FEMALE.pkl"],
        "male": ["basicmodel_m_lbs_10_207_0_v1.1.0.pkl", "SMPL_MALE.pkl"],
        "neutral": ["basicmodel_neutral_lbs_10_207_0_v1.1.0.pkl", "SMPL_NEUTRAL.pkl"]
    }

    for gender, names in models_map.items():
        src_file = None
        for name in names:
            p = os.path.join(src_dir, name)
            if os.path.exists(p):
                src_file = p
                break

        if src_file:
            for d in dest_dirs:
                out_npz = os.path.join(d, f"SMPL_{gender.upper()}.npz")
                convert_pkl_to_npz(src_file, out_npz)
        else:
            print(f"WARNING: No pkl file found for gender '{gender}' in {src_dir}")

    print("\nConversion complete!")


if __name__ == "__main__":
    main()
