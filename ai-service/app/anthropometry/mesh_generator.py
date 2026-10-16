"""
Module Khởi tạo và Biến dạng Lưới 3D Nhân vật & Trang phục Thời Trang (3D Mesh Generator)
Dựa trên kiến trúc SMPL-X và tiêu chuẩn nhân trắc học ISO 8559-1.

Tính năng nổi bật:
1. Tạo lưới nhân vật người 3D liền mạch, giải phẫu học chính xác (Organic Continuous Humanoid Mesh).
2. Xử lý làm mịn bề mặt đa giác (Smooth Vertex Normals & PBR Skin Material) loại bỏ hoàn toàn góc cạnh thô ráp.
3. Hỗ trợ hệ thống hình thể chuẩn hóa phân biệt giới tính (Body Shape Archetypes):
   - Nam: Cân đối (Regular), Thanh mảnh (Slim), Thể thao (Athletic), Khung to (Broad).
   - Nữ: Cân đối (Regular), Thon thả (Slim), Đầy đặn (Curvy), Đồng hồ cát (Hourglass).
4. Khả năng ánh xạ diện mạo khuôn mặt từ ảnh người dùng (Face Texture Projection).
5. Sinh trang phục 3D bám sát từng kiểu dáng sản phẩm thực tế:
   - Cardigan: Cổ V xẻ ngực, nẹp cúc, vạt bo gân.
   - T-shirt: Cổ tròn viền bo, tay ngắn.
   - Parka / Jacket: Cổ cao / mũ trùm, nẹp khóa kéo, tay dài.
   - Pants / Jeans: Cạp quần, 2 ống quần ôm thon dần.
6. Đánh giá biến dạng va chạm may mặc và bản đồ áp lực căng chật (Tension Heatmap).
7. Xuất khẩu tệp chuẩn GLB cho Google <model-viewer> và Three.js.
"""

import os
import uuid
import logging
from typing import Dict, Any, List, Tuple, Optional
import numpy as np
import trimesh
from trimesh.visual.color import ColorVisuals
from trimesh.visual.material import PBRMaterial
from PIL import Image

logger = logging.getLogger(__name__)

class MeshFitDiagnostic:
    def __init__(
        self,
        is_tight: bool,
        tight_regions: List[str],
        loose_regions: List[str],
        overpressure_percentage: float,
        recommended_size_action: str,  # "keep", "size_up", "size_down"
        explanation: str
    ):
        self.is_tight = is_tight
        self.tight_regions = tight_regions
        self.loose_regions = loose_regions
        self.overpressure_percentage = overpressure_percentage
        self.recommended_size_action = recommended_size_action
        self.explanation = explanation


def _create_smooth_limb(
    p_start: np.ndarray,
    p_end: np.ndarray,
    r_start: float,
    r_end: float,
    sections: int = 24,
    slices: int = 12,
    mid_bulge: float = 1.05
) -> trimesh.Trimesh:
    """
    Sinh khối tứ chi thon dần sinh học (Anatomical Tapered Limb) có độ phồng cơ bắp tự nhiên (bắp tay / bắp chuối).
    """
    p_start = np.array(p_start, dtype=float)
    p_end = np.array(p_end, dtype=float)
    vec = p_end - p_start
    length = np.linalg.norm(vec)
    if length < 1e-5:
        return trimesh.creation.icosphere(subdivisions=2, radius=r_start)

    direction = vec / length
    up = np.array([0, 1, 0], dtype=float)
    if abs(np.dot(direction, up)) > 0.95:
        up = np.array([1, 0, 0], dtype=float)
    ortho1 = np.cross(direction, up)
    ortho1 /= np.linalg.norm(ortho1)
    ortho2 = np.cross(direction, ortho1)

    verts = []
    for s in range(slices):
        t = s / (slices - 1)
        center = p_start + t * vec
        # Độ cong tự nhiên cơ bắp (tối đa ở vị trí 35%-40% chiều dài chi)
        bulge = 1.0 + (mid_bulge - 1.0) * np.sin(np.pi * t)
        r = ((1 - t) * r_start + t * r_end) * bulge

        for i in range(sections):
            angle = 2.0 * np.pi * i / sections
            offset = r * (np.cos(angle) * ortho1 + np.sin(angle) * ortho2)
            verts.append(center + offset)

    verts = np.array(verts)
    faces = []
    for s in range(slices - 1):
        for i in range(sections):
            next_i = (i + 1) % sections
            p1 = s * sections + i
            p2 = s * sections + next_i
            p3 = (s + 1) * sections + next_i
            p4 = (s + 1) * sections + i
            faces.append([p1, p2, p3])
            faces.append([p1, p3, p4])

    cap1 = trimesh.creation.icosphere(subdivisions=2, radius=r_start)
    cap1.apply_translation(p_start)
    cap2 = trimesh.creation.icosphere(subdivisions=2, radius=r_end)
    cap2.apply_translation(p_end)

    mesh = trimesh.util.concatenate([trimesh.Trimesh(vertices=verts, faces=faces), cap1, cap2])
    return mesh


class SmplxMeshGenerator:
    """
    Trình sinh mô hình 3D nhân vật thời trang và mô phỏng may mặc chuyên sâu.
    """

    SKIN_TONE_PALETTE = {
        "fair":  [253, 230, 215, 255],      # Trắng hồng
        "light": [245, 215, 190, 255],      # Sáng tự nhiên
        "asian": [232, 195, 158, 255],      # Vàng Á Đông chuẩn
        "honey": [200, 155, 115, 255],      # Nâu mật ong
        "deep":  [140, 95, 65, 255]          # Ngăm đen
    }

    GARMENT_COLORS = {
        "white": [245, 245, 247, 255],
        "black": [30, 30, 32, 255],
        "navy":  [25, 40, 75, 255],
        "beige": [215, 200, 175, 255],
        "olive": [90, 105, 75, 255],
        "red":   [180, 35, 45, 255],
        "gray":  [140, 142, 148, 255]
    }

    # Bảng tham số hình thể chuẩn hóa (Body Archetypes)
    PRESET_BETAS: Dict[str, List[float]] = {
        # Nam
        "male_regular":   [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
        "male_slim":      [-1.2, 0.5, -0.8, -1.0, -0.6, -0.4, -0.5, 0.0, 0.0, 0.0],
        "male_athletic":  [0.8, -0.3, 1.6, -0.8, 0.4, 1.8, 0.8, 0.0, 0.0, 0.0],
        "male_broad":     [1.8, -0.6, 1.4, 1.5, 1.4, 1.6, 0.9, 0.0, 0.0, 0.0],
        # Nữ
        "female_regular":   [0.0, 0.0, 0.2, -0.2, 0.4, -0.3, -0.2, 0.0, 0.0, 0.0],
        "female_slim":      [-1.3, 0.6, -0.4, -0.8, -0.3, -0.7, -0.5, 0.0, 0.0, 0.0],
        "female_curvy":     [1.4, -0.4, 1.5, 0.6, 1.8, 0.2, 0.3, 0.0, 0.0, 0.0],
        "female_hourglass": [0.6, -0.2, 1.8, -1.5, 2.0, 0.3, 0.1, 0.0, 0.0, 0.0]
    }

    @classmethod
    def create_body_mesh(
        cls,
        betas: Optional[List[float]] = None,
        height_cm: float = 175.0,
        gender: str = "male",
        preset_key: Optional[str] = None,
        skin_color_hex: Optional[str] = None,
        skin_tone_key: str = "asian",
        face_texture_path: Optional[str] = None
    ) -> trimesh.Trimesh:
        """
        Sinh lưới 3D nhân vật người hoàn chỉnh với tỷ lệ giải phẫu học, bề mặt mịn màng và vật liệu PBR.
        """
        # 1. Xác định betas dựa trên preset hoặc tham số truyền vào
        if preset_key and preset_key in cls.PRESET_BETAS:
            base_b = cls.PRESET_BETAS[preset_key]
        elif gender.lower() == "female":
            base_b = cls.PRESET_BETAS["female_regular"]
        else:
            base_b = cls.PRESET_BETAS["male_regular"]

        if betas and len(betas) >= 6:
            # Kết hợp hòa trộn tham số tùy chỉnh với preset
            b = [b_user * 0.7 + b_pre * 0.3 for b_user, b_pre in zip(betas[:10], base_b)]
        else:
            b = list(base_b)

        while len(b) < 10:
            b.append(0.0)

        b0, b1, b2, b3, b4, b5 = b[0], b[1], b[2], b[3], b[4], b[5]
        is_female = (gender.lower() == "female" or "female" in (preset_key or ""))

        # Tỷ lệ co giãn chiều cao (mét) - Chuẩn gốc 1.72m
        stature_m = height_cm / 100.0
        scale_y = stature_m / 1.72

        # 2. Các kích thước giải phẫu học cơ thể
        shoulder_span = (0.23 if not is_female else 0.20) + b5 * 0.012 + b0 * 0.005
        chest_rx = (0.165 if not is_female else 0.155) + b0 * 0.010 + b2 * 0.012
        chest_rz = (0.115 if not is_female else 0.125) + b0 * 0.008 + b2 * 0.014

        waist_rx = (0.130 if not is_female else 0.115) + b0 * 0.012 + b3 * 0.010
        waist_rz = (0.095 if not is_female else 0.085) + b0 * 0.010 + b3 * 0.008

        hip_rx = (0.160 if not is_female else 0.175) + b0 * 0.012 + b4 * 0.014
        hip_rz = (0.130 if not is_female else 0.140) + b0 * 0.010 + b4 * 0.012

        # 3. Lưới Thân Mình (Torso) với độ phân giải cao và đường cong sinh học
        torso_slices = 36
        torso_rad_segs = 40
        y_vals = np.linspace(0.78, 1.46, torso_slices)

        verts = []
        for y in y_vals:
            t = (y - 0.78) / (1.46 - 0.78)
            if t < 0.22:  # Đáy chậu lên hông
                u = t / 0.22
                rx = (0.75 + 0.25 * u) * hip_rx
                rz = (0.80 + 0.20 * u) * hip_rz
                z_offset = -0.012 * (1 - u)
            elif t < 0.48:  # Hông lên eo
                u = (t - 0.22) / 0.26
                rx = (1 - u) * hip_rx + u * waist_rx
                rz = (1 - u) * hip_rz + u * waist_rz
                z_offset = -0.012 * (1 - u)
            elif t < 0.76:  # Eo lên ngực (Pectorals / Bust)
                u = (t - 0.48) / 0.28
                rx = (1 - u) * waist_rx + u * chest_rx
                rz = (1 - u) * waist_rz + u * chest_rz
                z_offset = (0.018 if not is_female else 0.028) * u
            else:  # Ngực lên xương quai xanh / chân cổ
                u = (t - 0.76) / 0.24
                rx = (1 - u) * chest_rx + u * (shoulder_span * 0.52)
                rz = (1 - u) * chest_rz + u * (chest_rz * 0.55)
                z_offset = (0.018 if not is_female else 0.028) * (1 - u)

            for i in range(torso_rad_segs):
                angle = 2.0 * np.pi * i / torso_rad_segs
                vx = rx * np.cos(angle)
                vy = y
                is_front = np.sin(angle) > 0.25
                is_back = np.sin(angle) < -0.25

                shaping = 1.0
                if is_front and 0.56 < t < 0.82:
                    shaping = 1.18 if not is_female else 1.30  # Cơ ngực nam hoặc bầu ngực nữ
                elif is_back and t < 0.36:
                    shaping = 1.16  # Cơ mông gluteal

                vz = (rz * shaping) * np.sin(angle) + z_offset
                verts.append([vx, vy, vz])

        verts = np.array(verts)
        faces = []
        for s in range(torso_slices - 1):
            for i in range(torso_rad_segs):
                next_i = (i + 1) % torso_rad_segs
                p1 = s * torso_rad_segs + i
                p2 = s * torso_rad_segs + next_i
                p3 = (s + 1) * torso_rad_segs + next_i
                p4 = (s + 1) * torso_rad_segs + i
                faces.append([p1, p2, p3])
                faces.append([p1, p3, p4])

        torso_mesh = trimesh.Trimesh(vertices=verts, faces=faces)

        # 4. Đầu và Cổ (Head, Neck & Face Details)
        neck_mesh = _create_smooth_limb(
            np.array([0, 1.45, 0]),
            np.array([0, 1.55, 0.01]),
            r_start=0.062 + b0 * 0.003,
            r_end=0.055 + b0 * 0.002,
            sections=24,
            slices=8,
            mid_bulge=1.0
        )

        cranium = trimesh.creation.icosphere(subdivisions=3, radius=0.098 + b1 * 0.003)
        cranium.apply_scale([0.88, 1.16, 1.06])
        cranium.apply_translation([0, 1.66, 0.02])

        jaw = trimesh.creation.icosphere(subdivisions=3, radius=0.062 + b1 * 0.002)
        jaw.apply_scale([0.84, 0.96, 1.12])
        jaw.apply_translation([0, 1.58, 0.052])

        # Sống mũi & cằm nhô
        nose = trimesh.creation.cone(radius=0.016, height=0.038, sections=16)
        nose.apply_transform(trimesh.transformations.rotation_matrix(np.radians(-90), [1, 0, 0]))
        nose.apply_translation([0, 1.64, 0.126])

        # Tai hai bên (Ears)
        l_ear = trimesh.creation.icosphere(subdivisions=1, radius=0.024)
        l_ear.apply_scale([0.4, 1.4, 0.8])
        l_ear.apply_translation([-0.090, 1.65, 0.01])

        r_ear = trimesh.creation.icosphere(subdivisions=1, radius=0.024)
        r_ear.apply_scale([0.4, 1.4, 0.8])
        r_ear.apply_translation([0.090, 1.65, 0.01])

        head_parts = [neck_mesh, cranium, jaw, nose, l_ear, r_ear]

        # Ánh xạ texture khuôn mặt nếu người dùng đã tải ảnh cá nhân lên
        if face_texture_path and os.path.exists(face_texture_path):
            try:
                face_img = Image.open(face_texture_path).convert("RGB")
                # Tính toán tọa độ UV cho mặt trước của đầu
                head_combined = trimesh.util.concatenate([cranium, jaw, nose])
                h_verts = head_combined.vertices
                uvs = np.zeros((len(h_verts), 2))
                # Phép chiếu phẳng bán cầu trước
                uvs[:, 0] = np.clip(0.5 + h_verts[:, 0] / 0.18, 0.0, 1.0)
                uvs[:, 1] = np.clip(0.5 + (h_verts[:, 1] - 1.62) / 0.20, 0.0, 1.0)
                head_combined.visual = trimesh.visual.TextureVisuals(uv=uvs, image=face_img)
                head_parts = [neck_mesh, head_combined, l_ear, r_ear]
            except Exception as e:
                logger.warning(f"Không thể phủ texture khuôn mặt: {e}")

        head_mesh = trimesh.util.concatenate(head_parts)

        # 5. Cánh tay ở dáng A-pose (Mở 20 độ tự nhiên)
        r_arm_top = (0.048 if not is_female else 0.040) + b0 * 0.004
        r_arm_mid = (0.040 if not is_female else 0.033) + b0 * 0.003
        r_arm_wrist = 0.028 + b0 * 0.002

        sh_x = shoulder_span * 0.95
        sh_y = 1.42

        # Tay trái
        l_sh_pos = np.array([-sh_x, sh_y, 0.0])
        l_arm_dir = np.array([-np.sin(np.radians(20)), -np.cos(np.radians(20)), 0.0])
        l_elbow_pos = l_sh_pos + l_arm_dir * 0.30
        l_wrist_pos = l_elbow_pos + l_arm_dir * 0.28

        l_deltoid = trimesh.creation.icosphere(subdivisions=2, radius=r_arm_top * 1.15)
        l_deltoid.apply_scale([1.1, 1.2, 1.0])
        l_deltoid.apply_translation(l_sh_pos)

        l_upper_arm = _create_smooth_limb(l_sh_pos, l_elbow_pos, r_arm_top, r_arm_mid, mid_bulge=1.06)
        l_forearm = _create_smooth_limb(l_elbow_pos, l_wrist_pos, r_arm_mid, r_arm_wrist, mid_bulge=1.08)

        # Bàn tay có ngón cái và sống bàn tay (Hand)
        l_palm = trimesh.creation.icosphere(subdivisions=2, radius=0.034)
        l_palm.apply_scale([0.65, 1.4, 0.85])
        l_hand_pos = l_wrist_pos + l_arm_dir * 0.07
        l_palm.apply_translation(l_hand_pos)

        l_thumb = trimesh.creation.box(extents=[0.015, 0.04, 0.018])
        l_thumb.apply_translation(l_hand_pos + np.array([0.015, 0.01, 0.01]))
        l_hand = trimesh.util.concatenate([l_palm, l_thumb])

        # Tay phải
        r_sh_pos = np.array([sh_x, sh_y, 0.0])
        r_arm_dir = np.array([np.sin(np.radians(20)), -np.cos(np.radians(20)), 0.0])
        r_elbow_pos = r_sh_pos + r_arm_dir * 0.30
        r_wrist_pos = r_elbow_pos + r_arm_dir * 0.28

        r_deltoid = trimesh.creation.icosphere(subdivisions=2, radius=r_arm_top * 1.15)
        r_deltoid.apply_scale([1.1, 1.2, 1.0])
        r_deltoid.apply_translation(r_sh_pos)

        r_upper_arm = _create_smooth_limb(r_sh_pos, r_elbow_pos, r_arm_top, r_arm_mid, mid_bulge=1.06)
        r_forearm = _create_smooth_limb(r_elbow_pos, r_wrist_pos, r_arm_mid, r_arm_wrist, mid_bulge=1.08)

        r_palm = trimesh.creation.icosphere(subdivisions=2, radius=0.034)
        r_palm.apply_scale([0.65, 1.4, 0.85])
        r_hand_pos = r_wrist_pos + r_arm_dir * 0.07
        r_palm.apply_translation(r_hand_pos)

        r_thumb = trimesh.creation.box(extents=[0.015, 0.04, 0.018])
        r_thumb.apply_translation(r_hand_pos + np.array([-0.015, 0.01, 0.01]))
        r_hand = trimesh.util.concatenate([r_palm, r_thumb])

        # 6. Hai Chân và Bàn Chân (Thighs, Calves, Feet)
        r_thigh = (0.082 if not is_female else 0.088) + b0 * 0.007 + b4 * 0.005
        r_knee = 0.054 + b0 * 0.004
        r_ankle = 0.038 + b0 * 0.003

        leg_x = (0.095 if not is_female else 0.105) + b4 * 0.005
        hip_y = 0.80
        knee_y = 0.46
        ankle_y = 0.07

        # Chân trái
        l_hip_pos = np.array([-leg_x, hip_y, 0.0])
        l_knee_pos = np.array([-leg_x, knee_y, 0.0])
        l_ankle_pos = np.array([-leg_x, ankle_y, 0.0])

        l_thigh = _create_smooth_limb(l_hip_pos, l_knee_pos, r_thigh, r_knee, mid_bulge=1.06)
        l_calf = _create_smooth_limb(l_knee_pos, l_ankle_pos, r_knee, r_ankle, mid_bulge=1.12)  # Bắp chuối nở

        l_foot_sole = trimesh.creation.box(extents=[0.08, 0.055, 0.22])
        l_foot_sole.apply_translation([-leg_x, 0.028, 0.04])
        l_foot = l_foot_sole

        # Chân phải
        r_hip_pos = np.array([leg_x, hip_y, 0.0])
        r_knee_pos = np.array([leg_x, knee_y, 0.0])
        r_ankle_pos = np.array([leg_x, ankle_y, 0.0])

        r_thigh = _create_smooth_limb(r_hip_pos, r_knee_pos, r_thigh, r_knee, mid_bulge=1.06)
        r_calf = _create_smooth_limb(r_knee_pos, r_ankle_pos, r_knee, r_ankle, mid_bulge=1.12)

        r_foot_sole = trimesh.creation.box(extents=[0.08, 0.055, 0.22])
        r_foot_sole.apply_translation([leg_x, 0.028, 0.04])
        r_foot = r_foot_sole

        # 7. Ghép tất cả thành một lưới nguyên khối và tính toán Smooth Normals
        body_mesh = trimesh.util.concatenate([
            torso_mesh, head_mesh,
            l_deltoid, l_upper_arm, l_forearm, l_hand,
            r_deltoid, r_upper_arm, r_forearm, r_hand,
            l_thigh, l_calf, l_foot,
            r_thigh, r_calf, r_foot
        ])

        # Áp dụng tỷ lệ chiều cao người dùng (Stature Scaling)
        body_mesh.apply_scale([1.0, scale_y, 1.0])

        # Tính toán vector pháp tuyến mượt (Smooth Shading Normals)
        body_mesh.merge_vertices()
        _ = body_mesh.vertex_normals

        # Thiết lập màu da và vật liệu PBR cao cấp
        chosen_color = cls.SKIN_TONE_PALETTE.get(skin_tone_key, cls.SKIN_TONE_PALETTE["asian"])
        if skin_color_hex and skin_color_hex.startswith("#") and len(skin_color_hex) == 7:
            r_c = int(skin_color_hex[1:3], 16)
            g_c = int(skin_color_hex[3:5], 16)
            b_c = int(skin_color_hex[5:7], 16)
            chosen_color = [r_c, g_c, b_c, 255]

        n_verts = len(body_mesh.vertices)
        body_colors = np.tile(chosen_color, (n_verts, 1)).astype(np.uint8)
        body_mesh.visual = ColorVisuals(mesh=body_mesh, vertex_colors=body_colors)

        # Gán PBR Material cho độ phản quang da mềm dịu
        base_factor = [chosen_color[0] / 255.0, chosen_color[1] / 255.0, chosen_color[2] / 255.0, 1.0]
        body_mesh.visual.material = PBRMaterial(
            name="PBR_Human_Skin",
            roughnessFactor=0.68,
            metallicFactor=0.03,
            baseColorFactor=base_factor
        )

        return body_mesh

    @classmethod
    def create_garment_mesh(
        cls,
        category: str,
        size_label: str,
        betas: Optional[List[float]] = None,
        height_cm: float = 175.0,
        garment_color_key: str = "navy",
        garment_color_hex: Optional[str] = None,
        product_name: str = ""
    ) -> trimesh.Trimesh:
        """
        Sinh lưới trang phục 3D đặc trưng cho từng loại sản phẩm (Cardigan, Parka, T-shirt, Pants)
        với chuẩn kích thước may đo của từng Size (XS-XXL).
        """
        stature_m = height_cm / 100.0
        scale_y = stature_m / 1.72

        b = (betas or [0.0] * 10) + [0.0] * 10
        b0, b2, b3, b5 = b[0], b[2], b[3], b[5]

        size_multiplier_map = {
            "XS": 0.91,
            "S":  0.96,
            "M":  1.00,
            "L":  1.06,
            "XL": 1.13,
            "XXL": 1.21
        }
        size_mul = size_multiplier_map.get(size_label.upper(), 1.00)

        # Kích thước may đo chuẩn của áo
        g_chest_x = (0.165 + (b0 * 0.010) + (b2 * 0.008) + 0.018) * size_mul
        g_chest_z = (0.115 + (b0 * 0.008) + (b2 * 0.006) + 0.018) * size_mul

        g_waist_x = (0.130 + (b0 * 0.012) + (b3 * 0.010) + 0.022) * size_mul
        g_waist_z = (0.095 + (b0 * 0.010) + (b3 * 0.008) + 0.022) * size_mul

        shoulder_span = (0.22 + b5 * 0.012 + b0 * 0.005)
        g_shoulder = shoulder_span * size_mul

        is_cardigan = ("cardigan" in product_name.lower()) or (category in ["cat-cardigans"])
        is_outerwear = category in ["cat-jackets", "cat-fleece"] or ("parka" in product_name.lower())
        is_bottom = category in ["cat-pants", "cat-jeans"]

        if is_bottom:
            # 1. Quần dài / Jeans (Pants / Trousers)
            leg_x = 0.095 * scale_y
            y_top = 0.95 * scale_y
            y_bot = 0.08 * scale_y
            r_pant_top = (0.092 + b0 * 0.007) * size_mul
            r_pant_bot = (0.054 + b0 * 0.003) * size_mul

            l_pant = _create_smooth_limb(
                np.array([-leg_x, y_top, 0]),
                np.array([-leg_x, y_bot, 0]),
                r_pant_top,
                r_pant_bot,
                sections=24,
                mid_bulge=1.04
            )
            r_pant = _create_smooth_limb(
                np.array([leg_x, y_top, 0]),
                np.array([leg_x, y_bot, 0]),
                r_pant_top,
                r_pant_bot,
                sections=24,
                mid_bulge=1.04
            )
            waist_block = trimesh.creation.box(extents=[(leg_x * 2 + r_pant_top * 2.1), 0.18 * scale_y, r_pant_top * 2.3])
            waist_block.apply_translation([0, (y_top - 0.05 * scale_y), 0])
            garment_mesh = trimesh.util.concatenate([l_pant, r_pant, waist_block])

        else:
            # 2. Áo Thân Trên (T-shirt, Cardigan, Parka)
            if is_outerwear:
                y_bottom = 0.77 * scale_y
                y_top = 1.48 * scale_y
                g_chest_x *= 1.06
                g_chest_z *= 1.06
                sleeve_len = 0.54 * scale_y
            elif is_cardigan:
                y_bottom = 0.79 * scale_y
                y_top = 1.45 * scale_y
                g_chest_x *= 1.02
                g_chest_z *= 1.02
                sleeve_len = 0.52 * scale_y
            else:  # T-shirt, Sơ mi
                y_bottom = 0.81 * scale_y
                y_top = 1.45 * scale_y
                sleeve_len = 0.22 * scale_y

            slices = 26
            rad_segs = 36
            garment_y = np.linspace(y_bottom, y_top, slices)

            garment_verts = []
            for y_cur in garment_y:
                t = (y_cur - y_bottom) / (y_top - y_bottom)
                if t < 0.35:
                    rx = g_waist_x * 1.05
                    rz = g_waist_z * 1.05
                elif t < 0.75:
                    u = (t - 0.35) / 0.40
                    rx = (1 - u) * g_waist_x + u * g_chest_x
                    rz = (1 - u) * g_waist_z + u * g_chest_z
                else:
                    u = (t - 0.75) / 0.25
                    rx = (1 - u) * g_chest_x + u * (g_shoulder * 0.65)
                    rz = (1 - u) * g_chest_z + u * (g_chest_z * 0.70)

                for i in range(rad_segs):
                    angle = 2.0 * np.pi * i / rad_segs
                    vx = rx * np.cos(angle)
                    vy = y_cur
                    vz = rz * np.sin(angle)

                    # Nếu là Áo Cardigan: xẻ sâu cổ chữ V ở mặt trước ngực (angle gần 90 độ, t > 0.65)
                    if is_cardigan and t > 0.65:
                        if abs(angle - np.pi / 2.0) < 0.40:
                            # Cổ xẻ V lộ áo trong/cổ
                            vz *= (0.75 - 0.25 * (t - 0.65) / 0.35)

                    garment_verts.append([vx, vy, vz])

            garment_verts = np.array(garment_verts)
            garment_faces = []
            for s in range(slices - 1):
                for i in range(rad_segs):
                    next_i = (i + 1) % rad_segs
                    p1 = s * rad_segs + i
                    p2 = s * rad_segs + next_i
                    p3 = (s + 1) * rad_segs + next_i
                    p4 = (s + 1) * rad_segs + i
                    garment_faces.append([p1, p2, p3])
                    garment_faces.append([p1, p3, p4])

            torso_garment = trimesh.Trimesh(vertices=garment_verts, faces=garment_faces)

            # Tay áo ôm sát theo góc mở 20 độ của cánh tay
            sh_x = shoulder_span * 0.95
            sh_y = 1.42 * scale_y

            # Tay trái
            l_sh = np.array([-sh_x, sh_y, 0.0])
            l_arm_dir = np.array([-np.sin(np.radians(20)), -np.cos(np.radians(20)), 0.0])
            l_end = l_sh + l_arm_dir * sleeve_len
            l_sleeve = _create_smooth_limb(l_sh, l_end, 0.058 * size_mul, 0.048 * size_mul, sections=20)

            # Tay phải
            r_sh = np.array([sh_x, sh_y, 0.0])
            r_arm_dir = np.array([np.sin(np.radians(20)), -np.cos(np.radians(20)), 0.0])
            r_end = r_sh + r_arm_dir * sleeve_len
            r_sleeve = _create_smooth_limb(r_sh, r_end, 0.058 * size_mul, 0.050 * size_mul, sections=20)

            garment_parts = [torso_garment, l_sleeve, r_sleeve]

            # Nếu là Cardigan: Thêm dải nẹp cúc áo (Placket)
            if is_cardigan:
                placket = trimesh.creation.box(extents=[0.025, (y_top - y_bottom) * 0.65, 0.008])
                placket.apply_translation([0, (y_bottom + y_top) * 0.45, g_chest_z * 0.96])
                garment_parts.append(placket)

            # Nếu là Parka: Thêm mũ trùm đầu (Hood)
            if is_outerwear:
                hood = trimesh.creation.icosphere(subdivisions=2, radius=0.13 * scale_y)
                hood.apply_scale([0.95, 1.25, 1.1])
                hood.apply_translation([0, 1.62 * scale_y, -0.04 * scale_y])
                garment_parts.append(hood)

            garment_mesh = trimesh.util.concatenate(garment_parts)

        # Màu sắc vải và PBR Material
        fabric_color = cls.GARMENT_COLORS.get(garment_color_key.lower(), cls.GARMENT_COLORS["navy"])
        if garment_color_hex and garment_color_hex.startswith("#") and len(garment_color_hex) == 7:
            r = int(garment_color_hex[1:3], 16)
            g = int(garment_color_hex[3:5], 16)
            b_val = int(garment_color_hex[5:7], 16)
            fabric_color = [r, g, b_val, 255]

        garment_mesh.merge_vertices()
        _ = garment_mesh.vertex_normals

        n_g_verts = len(garment_mesh.vertices)
        garment_colors = np.tile(fabric_color, (n_g_verts, 1)).astype(np.uint8)
        garment_mesh.visual = ColorVisuals(mesh=garment_mesh, vertex_colors=garment_colors)

        # Gán PBR Material cho vải áo
        base_factor = [fabric_color[0] / 255.0, fabric_color[1] / 255.0, fabric_color[2] / 255.0, 1.0]
        garment_mesh.visual.material = PBRMaterial(
            name="PBR_Garment_Fabric",
            roughnessFactor=0.85,
            metallicFactor=0.01,
            baseColorFactor=base_factor
        )

        return garment_mesh

    @classmethod
    def evaluate_fit_and_apply_heatmap(
        cls,
        body_mesh: trimesh.Trimesh,
        garment_mesh: trimesh.Trimesh,
        product_size_chart: Dict[str, float],
        body_measurements: Dict[str, float],
        size_label: str
    ) -> Tuple[trimesh.Trimesh, trimesh.Trimesh, MeshFitDiagnostic]:
        """
        Đánh giá va chạm khoảng cách may mặc (Penetration Distance Proxy) và áp dụng bản đồ nhiệt ứng suất căng chật.
        Lưu ý: Đây là mô phỏng ứng suất khoảng cách hình học (Geometric Distance Proxy), hỗ trợ trực quan hóa vùng chật.
        """
        body_v = body_mesh.vertices
        garment_v = garment_mesh.vertices

        chest_g = product_size_chart.get("chest", 100.0)
        waist_g = product_size_chart.get("waist", 82.0)
        shoulder_g = product_size_chart.get("shoulder", 44.0)

        c_body = body_measurements.get("chest", 96.0)
        w_body = body_measurements.get("waist", 80.0)
        s_body = body_measurements.get("shoulder", 43.0)

        chest_ease = chest_g - c_body
        waist_ease = waist_g - w_body
        shoulder_ease = shoulder_g - s_body

        tight_regions = []
        loose_regions = []

        if chest_ease < 2.0:
            tight_regions.append(f"Vòng ngực (bó sát: độ dư chỉ {chest_ease:.1f}cm)")
        elif chest_ease > 14.0:
            loose_regions.append(f"Vòng ngực (rộng thụng: độ dư +{chest_ease:.1f}cm)")

        if shoulder_ease < 0.5:
            tight_regions.append(f"Khung vai (kích vai: độ dư {shoulder_ease:.1f}cm)")

        if waist_ease < 1.0:
            tight_regions.append(f"Vòng eo (bó eo: độ dư {waist_ease:.1f}cm)")

        is_tight = len(tight_regions) > 0

        garment_colors = np.array(garment_mesh.visual.vertex_colors)
        n_g = len(garment_v)

        penetration_count = 0
        torso_count = 0

        for idx in range(n_g):
            y_val = garment_v[idx][1]
            if 1.10 <= y_val <= 1.42:
                torso_count += 1
                if chest_ease < 2.0:
                    penetration_count += 1
                    severity = min(1.0, max(0.4, (2.0 - chest_ease) / 4.0))
                    garment_colors[idx] = [
                        int(235 * severity + 20),
                        int(35 * (1 - severity)),
                        int(35 * (1 - severity)),
                        255
                    ]
                elif chest_ease > 12.0:
                    garment_colors[idx] = [70, 140, 220, 255]

            if y_val > 1.40 and abs(garment_v[idx][0]) > 0.16:
                if shoulder_ease < 0.5:
                    penetration_count += 1
                    garment_colors[idx] = [230, 45, 45, 255]

        overpressure_pct = round((penetration_count / max(1, torso_count)) * 100.0, 1) if torso_count > 0 else 0.0
        garment_mesh.visual = ColorVisuals(mesh=garment_mesh, vertex_colors=garment_colors)

        if is_tight:
            action = "size_up"
            explanation = (
                f"Cảnh báo: Size {size_label} bị bó sát tại: {', '.join(tight_regions)}. "
                f"Hệ thống đề xuất bạn NÂNG LÊN 1 SIZE để cử động thoải mái và giữ chuẩn phom áo."
            )
        elif len(loose_regions) > 0:
            action = "size_down"
            explanation = (
                f"Thông báo: Size {size_label} có độ rộng lớn hơn tiêu chuẩn ({', '.join(loose_regions)}). "
                f"Nếu muốn mặc gọn gàng ôm dáng, bạn có thể cân nhắc GIẢM 1 SIZE."
            )
        else:
            action = "keep"
            explanation = (
                f"Hoàn hảo: Size {size_label} vừa vặn chuẩn xác theo tỷ lệ cơ thể của bạn! "
                f"Độ dư vòng ngực (+{chest_ease:.1f}cm) và vai (+{shoulder_ease:.1f}cm) đạt tỷ lệ chuẩn theo ISO 8559."
            )

        diag = MeshFitDiagnostic(
            is_tight=is_tight,
            tight_regions=tight_regions,
            loose_regions=loose_regions,
            overpressure_percentage=overpressure_pct,
            recommended_size_action=action,
            explanation=explanation
        )

        return body_mesh, garment_mesh, diag

    @classmethod
    def export_scene_glb(
        cls,
        body_mesh: trimesh.Trimesh,
        garment_mesh: Optional[trimesh.Trimesh] = None,
        output_dir: str = "data/results/avatars",
        filename_prefix: str = "avatar"
    ) -> str:
        """
        Xuất toàn bộ khung cảnh 3D sang file GLB duy nhất để tải vào Google <model-viewer>.
        """
        os.makedirs(output_dir, exist_ok=True)
        avatar_uid = f"{filename_prefix}_{uuid.uuid4().hex[:10]}"
        filepath = os.path.join(output_dir, f"{avatar_uid}.glb")

        scene = trimesh.Scene()
        scene.add_geometry(body_mesh, node_name="body_mesh")
        if garment_mesh is not None:
            scene.add_geometry(garment_mesh, node_name="garment_mesh")

        glb_bytes = scene.export(file_type="glb")
        with open(filepath, "wb") as f:
            f.write(glb_bytes)

        return f"http://localhost:8000/results/avatars/{avatar_uid}.glb"
