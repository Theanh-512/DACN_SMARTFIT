import os
import sys
import types
import logging
from typing import List, Tuple, Optional, Dict, Any
import numpy as np
import trimesh

logger = logging.getLogger("ml_service.body_model")
logging.basicConfig(level=logging.INFO)

# Chumpy shim helper
def _ensure_chumpy_shim():
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

    import scipy.sparse
    if "scipy.sparse.csc" not in sys.modules:
        sys.modules["scipy.sparse.csc"] = scipy.sparse


class BodyModel:
    """
    Parametric 3D Human Body Model supporting both SMPL (6890 verts, 13776 faces)
    and SMPL-X (10475 verts, 20908 faces) via the official smplx library.
    Controlled via environment variable BODY_MODEL=smpl|smplx (auto-detects if unset).
    Includes smooth fallback to procedural parametric mock mesh when weights are absent.
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        gender: str = "neutral",
        num_betas: int = 10,
        device: str = "cpu",
        model_type: Optional[str] = None
    ):
        self.gender = gender.lower().strip()
        self.num_betas = num_betas
        self.device = device
        self.is_mock = True
        self.torch_model = None
        self._faces = None

        # Determine requested model type (smpl vs smplx)
        env_type = os.getenv("BODY_MODEL", "").lower().strip()
        self.model_type = model_type.lower().strip() if model_type else (env_type if env_type in ["smpl", "smplx"] else None)

        # Base directories
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if model_path is not None:
            self.asset_dirs = [model_path] if os.path.exists(model_path) else []
        else:
            self.asset_dirs = [
                os.path.join(base_dir, "assets", "smpl"),
                os.path.join(base_dir, "assets", "smplx")
            ]
            self.asset_dirs = [d for d in self.asset_dirs if os.path.exists(d)]

        self._try_load_model()

    def _try_load_model(self):
        """
        Attempts to load pretrained weights for SMPL or SMPL-X based on model_type or available files.
        """
        if not self.asset_dirs:
            logger.warning("[MOCK MODE] No asset directories found. Activating mock mode.")
            self.is_mock = True
            self.model_type = "mock"
            return

        # Check candidate files across asset directories
        # Order of preference based on self.model_type
        types_to_try = [self.model_type] if self.model_type else ["smpl", "smplx"]

        for mtype in types_to_try:
            if mtype == "smpl":
                if self._load_smpl():
                    self.model_type = "smpl"
                    self.is_mock = False
                    return
            elif mtype == "smplx":
                if self._load_smplx():
                    self.model_type = "smplx"
                    self.is_mock = False
                    return

        logger.warning(
            f"[MOCK MODE] Neither SMPL nor SMPL-X model weights found in {self.asset_dirs}. "
            f"Running in parametric MOCK MODE without crashing."
        )
        self.is_mock = True
        self.model_type = "mock"

    def _load_smpl(self) -> bool:
        """Attempt to load official SMPL model from .npz or .pkl."""
        import torch
        import smplx
        from smplx.body_models import Struct

        candidates = [
            f"SMPL_{self.gender.upper()}.npz",
            f"SMPL_{self.gender.upper()}.pkl",
            f"basicmodel_{self.gender[0]}_lbs_10_207_0_v1.1.0.pkl",
            f"basicmodel_{self.gender}_lbs_10_207_0_v1.1.0.pkl"
        ]

        found_path = None
        for d in self.asset_dirs:
            for c in candidates:
                p = os.path.join(d, c)
                if os.path.exists(p):
                    found_path = p
                    break
            if found_path:
                break

        if not found_path:
            return False

        logger.info(f"Loading official SMPL model ({self.gender}) from '{found_path}'...")
        try:
            if found_path.endswith(".npz"):
                npz_data = np.load(found_path, allow_pickle=True)
                data_struct = Struct(**npz_data)
                self.torch_model = smplx.SMPL(
                    model_path="",
                    data_struct=data_struct,
                    gender=self.gender,
                    num_betas=self.num_betas
                ).to(self.device)
            else:
                _ensure_chumpy_shim()
                import pickle
                with open(found_path, "rb") as f:
                    raw_data = pickle.load(f, encoding="latin1")
                # Wrap dictionary cleanly
                clean_dict = {}
                for k in ["v_template", "shapedirs", "posedirs", "J_regressor", "weights", "kintree_table", "f"]:
                    v = raw_data[k]
                    if hasattr(v, "x"):
                        v = v.x
                    elif hasattr(v, "toarray"):
                        v = v.toarray()
                    clean_dict[k] = np.array(v)
                data_struct = Struct(**clean_dict)
                self.torch_model = smplx.SMPL(
                    model_path="",
                    data_struct=data_struct,
                    gender=self.gender,
                    num_betas=self.num_betas
                ).to(self.device)

            self.torch_model.eval()
            self.is_mock = False
            self._faces = self.torch_model.faces.astype(np.int32)
            logger.info(f"Successfully initialized official SMPL model ({self.gender}, {self.num_vertices} vertices).")
            return True
        except Exception as e:
            logger.warning(f"Failed to load SMPL model from '{found_path}': {e}")
            return False

    def _load_smplx(self) -> bool:
        """Attempt to load official SMPL-X model from .npz or .pkl."""
        import torch
        import smplx

        candidates = [
            f"SMPLX_{self.gender.upper()}.npz",
            f"SMPLX_{self.gender.upper()}.pkl",
            f"smplx_{self.gender.lower()}.npz",
            f"smplx_{self.gender.lower()}.pkl"
        ]

        found_dir = None
        for d in self.asset_dirs:
            for c in candidates:
                if os.path.exists(os.path.join(d, c)):
                    found_dir = d
                    break
            if found_dir:
                break

        if not found_dir:
            return False

        logger.info(f"Loading official SMPL-X model ({self.gender}) from '{found_dir}'...")
        try:
            has_npz = any(f.endswith(".npz") for f in os.listdir(found_dir) if "smplx" in f.lower())
            self.torch_model = smplx.create(
                model_path=found_dir,
                model_type="smplx",
                gender=self.gender,
                num_betas=self.num_betas,
                ext="npz" if has_npz else "pkl"
            ).to(self.device)
            self.torch_model.eval()
            self.is_mock = False
            self._faces = self.torch_model.faces.astype(np.int32)
            logger.info(f"Successfully initialized official SMPL-X model ({self.gender}, {self.num_vertices} vertices).")
            return True
        except Exception as e:
            logger.warning(f"Failed to load SMPL-X model from '{found_dir}': {e}")
            return False

    @property
    def num_vertices(self) -> int:
        if not self.is_mock and self.torch_model is not None:
            return int(self.torch_model.v_template.shape[0])
        return 1842  # Canonical mock vertex count

    @property
    def num_faces(self) -> int:
        if self._faces is not None:
            return len(self._faces)
        return 3680

    @property
    def faces(self) -> np.ndarray:
        if self._faces is not None:
            return self._faces
        # Mock faces fallback
        _, f = self._build_mock_mesh([0.0] * self.num_betas)
        return f

    def build_mesh(
        self,
        betas: Optional[List[float]] = None,
        pose: str = "T-pose"
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Build 3D human body mesh from 10 shape parameters (betas).
        Returns:
            vertices: np.ndarray of shape (V, 3) in meters.
            faces: np.ndarray of shape (F, 3) vertex indices.
        """
        if betas is None:
            betas = [0.0] * self.num_betas
        else:
            betas = list(betas)
            while len(betas) < self.num_betas:
                betas.append(0.0)
            betas = betas[:self.num_betas]

        if not self.is_mock and self.torch_model is not None:
            return self._build_torch_mesh(betas, pose)
        else:
            return self._build_mock_mesh(betas, pose)

    def _build_torch_mesh(
        self,
        betas: List[float],
        pose: str
    ) -> Tuple[np.ndarray, np.ndarray]:
        """Generate mesh using real SMPL or SMPL-X PyTorch model forward pass."""
        import torch

        betas_tensor = torch.tensor([betas], dtype=torch.float32, device=self.device)
        pose_norm = pose.lower().replace("-", "_")

        with torch.no_grad():
            if pose_norm in ["a_pose", "apose"]:
                # Canonical A-pose: arms rotated ~25 degrees downwards around Z-axis
                num_body_joints = getattr(self.torch_model, "NUM_BODY_JOINTS", 23)
                body_pose = torch.zeros(1, num_body_joints * 3, dtype=torch.float32, device=self.device)
                angle = float(np.radians(25.0))
                # Left shoulder: Joint 16 in full 24-joint SMPL (index 15 in body_pose)
                # Right shoulder: Joint 17 in full 24-joint SMPL (index 16 in body_pose)
                body_pose[0, 15 * 3 + 2] = -angle
                body_pose[0, 16 * 3 + 2] = angle
                output = self.torch_model(betas=betas_tensor, body_pose=body_pose, return_verts=True)
            else:
                output = self.torch_model(betas=betas_tensor, return_verts=True)

            vertices = output.vertices[0].detach().cpu().numpy().astype(np.float32)
            faces = self.torch_model.faces.astype(np.int32)
        return vertices, faces

    def get_joints(
        self,
        betas: Optional[List[float]] = None,
        pose: str = "T-pose"
    ) -> np.ndarray:
        """Returns 3D joint locations of the model."""
        if betas is None:
            betas = [0.0] * self.num_betas
        if not self.is_mock and self.torch_model is not None:
            import torch
            betas_tensor = torch.tensor([betas], dtype=torch.float32, device=self.device)
            with torch.no_grad():
                output = self.torch_model(betas=betas_tensor, return_verts=True)
                if hasattr(output, "joints"):
                    return output.joints[0].detach().cpu().numpy()
                elif hasattr(self.torch_model, "J_regressor"):
                    jr = self.torch_model.J_regressor.detach().cpu().numpy()
                    v = output.vertices[0].detach().cpu().numpy()
                    return jr @ v
        # Mock fallback joints (pelvis, spine, neck, shoulders, wrists)
        return np.zeros((24, 3), dtype=np.float32)

    def _build_mock_mesh(
        self,
        betas: List[float],
        pose: str = "T-pose"
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Parametric humanoid mesh generator in canonical T-pose (fallback when weights missing).
        """
        b0 = float(betas[0])  # Overall mass / BMI
        b1 = float(betas[1])  # Stature elongation
        b2 = float(betas[2])  # Chest
        b3 = float(betas[3])  # Waist
        b4 = float(betas[4])  # Hip
        b5 = float(betas[5])  # Shoulder width

        stature = 1.72 + b1 * 0.05 + b0 * 0.015
        scale_y = stature / 1.72

        shoulder_half_span = 0.22 + b5 * 0.012 + b0 * 0.005
        chest_rx = 0.165 + b0 * 0.012 + b2 * 0.015
        chest_rz = 0.115 + b0 * 0.010 + b2 * 0.012

        waist_rx = 0.145 + b0 * 0.015 + b3 * 0.014
        waist_rz = 0.100 + b0 * 0.012 + b3 * 0.012

        hip_rx = 0.170 + b0 * 0.012 + b4 * 0.015
        hip_rz = 0.125 + b0 * 0.010 + b4 * 0.012

        y_pelvis = 0.85
        y_waist = 1.05
        y_chest = 1.25
        y_neck = 1.48
        y_head_top = 1.72

        n_theta = 24
        thetas = np.linspace(0, 2 * np.pi, n_theta, endpoint=False)
        cos_t = np.cos(thetas)
        sin_t = np.sin(thetas)

        torso_rings = [
            (y_pelvis - 0.06, hip_rx * 0.95, hip_rz * 0.95),
            (y_pelvis, hip_rx, hip_rz),
            (y_waist, waist_rx, waist_rz),
            (y_chest, chest_rx, chest_rz),
            (y_neck - 0.05, shoulder_half_span * 0.85, chest_rz * 0.95),
            (y_neck, 0.065, 0.065)
        ]

        ring_verts = []
        for y_r, rx, rz in torso_rings:
            for c, s in zip(cos_t, sin_t):
                ring_verts.append([rx * c, y_r, rz * s])

        torso_verts = np.array(ring_verts, dtype=np.float32)
        n_rings = len(torso_rings)
        torso_faces = []
        for r in range(n_rings - 1):
            for i in range(n_theta):
                next_i = (i + 1) % n_theta
                v0 = r * n_theta + i
                v1 = r * n_theta + next_i
                v2 = (r + 1) * n_theta + next_i
                v3 = (r + 1) * n_theta + i
                torso_faces.append([v0, v1, v2])
                torso_faces.append([v0, v2, v3])

        torso_mesh = trimesh.Trimesh(vertices=torso_verts, faces=np.array(torso_faces), process=False)
        neck = trimesh.creation.cylinder(radius=0.060, height=0.08, sections=16)
        neck.apply_translation([0, y_neck + 0.04, 0])

        head = trimesh.creation.icosphere(subdivisions=2, radius=0.11)
        head.apply_scale([0.9, 1.15, 1.0])
        head.apply_translation([0, y_neck + 0.16, 0.015])

        l_deltoid = trimesh.creation.icosphere(subdivisions=2, radius=0.065)
        l_deltoid.apply_translation([shoulder_half_span, y_chest + 0.14, 0])
        r_deltoid = trimesh.creation.icosphere(subdivisions=2, radius=0.065)
        r_deltoid.apply_translation([-shoulder_half_span, y_chest + 0.14, 0])

        arm_len = 0.52 + b1 * 0.02
        rot_arm = trimesh.transformations.rotation_matrix(np.pi / 2, [0, 0, 1])
        l_arm = trimesh.creation.cylinder(radius=0.045, height=arm_len, sections=16)
        l_arm.apply_transform(rot_arm)
        l_arm.apply_translation([shoulder_half_span + arm_len / 2.0, y_chest + 0.14, 0])

        r_arm = trimesh.creation.cylinder(radius=0.045, height=arm_len, sections=16)
        r_arm.apply_transform(rot_arm)
        r_arm.apply_translation([-(shoulder_half_span + arm_len / 2.0), y_chest + 0.14, 0])

        leg_len = 0.78
        l_leg = trimesh.creation.cylinder(radius=0.075, height=leg_len, sections=16)
        l_leg.apply_translation([0.10, y_pelvis - leg_len / 2.0, 0])
        r_leg = trimesh.creation.cylinder(radius=0.075, height=leg_len, sections=16)
        r_leg.apply_translation([-0.10, y_pelvis - leg_len / 2.0, 0])

        l_foot = trimesh.creation.box(extents=[0.09, 0.06, 0.22])
        l_foot.apply_translation([0.10, 0.03, 0.04])
        r_foot = trimesh.creation.box(extents=[0.09, 0.06, 0.22])
        r_foot.apply_translation([-0.10, 0.03, 0.04])

        body_mesh = trimesh.util.concatenate([
            torso_mesh, neck, head,
            l_deltoid, r_deltoid,
            l_arm, r_arm,
            l_leg, r_leg,
            l_foot, r_foot
        ])
        body_mesh.apply_scale([1.0, scale_y, 1.0])
        body_mesh.merge_vertices()

        return body_mesh.vertices.astype(np.float32), body_mesh.faces.astype(np.int32)

    def get_trimesh(
        self,
        betas: Optional[List[float]] = None,
        pose: str = "T-pose"
    ) -> trimesh.Trimesh:
        """Helper returning trimesh.Trimesh instance."""
        verts, faces = self.build_mesh(betas, pose)
        return trimesh.Trimesh(vertices=verts, faces=faces, process=False)
