import math
from typing import Dict, Any, List, Tuple, Optional
import numpy as np

class ParametricPatternGenerator:
    """
    Parametric 2D Sewing Pattern Generator (GarmentCode-inspired architecture).
    Generates 2D parametric apparel patterns (front, back, sleeves, collar)
    from flat garment size chart measurements (in cm) for t-shirts and cardigans.
    License note: GarmentCode (SIGGRAPH 2023) is MIT/Apache-2.0 permissive.
    """

    @classmethod
    def generate_pattern(
        cls,
        garment_type: str,
        size_spec: Dict[str, float],
        resolution_pts: int = 40
    ) -> Dict[str, Any]:
        """
        Generates 2D pattern pieces, UV coordinates, and seam connection topology.
        
        size_spec keys (cm):
          - chest_width_cm: Flat chest width (half total circumference)
          - body_length_cm: High point shoulder (HPS) to bottom hem
          - shoulder_width_cm: Across shoulder span
          - sleeve_length_cm: Sleeve crown to cuff
          - hem_width_cm: Flat bottom hem width
          - neck_circ_cm: Total collar/neckline circumference
        """
        g_type = garment_type.lower()
        if "cardigan" in g_type:
            return cls._generate_cardigan_pattern(size_spec, resolution_pts)
        elif "jacket" in g_type:
            return cls._generate_jacket_pattern(size_spec, resolution_pts)
        elif "tshirt" in g_type or "t-shirt" in g_type or "tee" in g_type:
            return cls._generate_tshirt_pattern(size_spec, resolution_pts)
        elif "shirt" in g_type:
            return cls._generate_shirt_pattern(size_spec, resolution_pts)
        else:
            return cls._generate_tshirt_pattern(size_spec, resolution_pts)

    @classmethod
    def _generate_tshirt_pattern(
        cls,
        spec: Dict[str, float],
        res: int
    ) -> Dict[str, Any]:
        """Generates classic crewneck T-shirt 2D sewing patterns."""
        cw = spec["chest_width_cm"]
        bl = spec["body_length_cm"]
        sw = spec["shoulder_width_cm"]
        sl = spec["sleeve_length_cm"]
        hw = spec["hem_width_cm"]
        nc = spec["neck_circ_cm"]

        # Geometric derived values
        neck_radius_x = (nc / (2.0 * math.pi)) * 1.15
        neck_drop_front = 8.5 # cm
        neck_drop_back = 2.8  # cm
        shoulder_drop = 3.8   # cm slope
        armhole_depth = min(25.0, 0.36 * bl) # cm from shoulder
        cuff_width = 17.5     # cm flat short sleeve opening

        # 1. Front Panel (Centered on X=0, Y from 0 [hem] to bl [HPS])
        # Perimeter polygon:
        # Bottom hem (hw/2 to -hw/2) -> Side seam -> Armhole -> Shoulder -> Neck -> Shoulder -> Armhole -> Side seam
        front_pts = []
        # Bottom hem
        front_pts.append([hw / 2.0, 0.0])
        # Right side seam up to armpit
        armpit_y = bl - armhole_depth
        front_pts.append([cw / 2.0, armpit_y])
        # Right armhole scye curve
        for t in np.linspace(0.0, 1.0, 8):
            ax = (1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.5 * math.sin(t * math.pi)
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            front_pts.append([ax, ay])
        # Right shoulder seam to neck
        front_pts.append([sw / 2.0, bl - shoulder_drop])
        front_pts.append([neck_radius_x, bl])
        # Front collar scoop curve
        for t in np.linspace(0.0, 1.0, 9):
            ang = t * math.pi
            nx = neck_radius_x * math.cos(ang)
            ny = bl - neck_drop_front * math.sin(ang)
            front_pts.append([nx, ny])
        # Left shoulder
        front_pts.append([-neck_radius_x, bl])
        front_pts.append([-sw / 2.0, bl - shoulder_drop])
        # Left armhole curve
        for t in np.linspace(1.0, 0.0, 8):
            ax = -((1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.5 * math.sin(t * math.pi))
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            front_pts.append([ax, ay])
        # Left side seam
        front_pts.append([-cw / 2.0, armpit_y])
        front_pts.append([-hw / 2.0, 0.0])

        # 2. Back Panel (Identical body, shallower back neck scoop)
        back_pts = []
        back_pts.append([hw / 2.0, 0.0])
        back_pts.append([cw / 2.0, armpit_y])
        for t in np.linspace(0.0, 1.0, 8):
            ax = (1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.5 * math.sin(t * math.pi)
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            back_pts.append([ax, ay])
        back_pts.append([sw / 2.0, bl - shoulder_drop])
        back_pts.append([neck_radius_x, bl])
        # Shallow back neck scoop
        for t in np.linspace(0.0, 1.0, 9):
            ang = t * math.pi
            nx = neck_radius_x * math.cos(ang)
            ny = bl - neck_drop_back * math.sin(ang)
            back_pts.append([nx, ny])
        back_pts.append([-neck_radius_x, bl])
        back_pts.append([-sw / 2.0, bl - shoulder_drop])
        for t in np.linspace(1.0, 0.0, 8):
            ax = -((1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.5 * math.sin(t * math.pi))
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            back_pts.append([ax, ay])
        back_pts.append([-cw / 2.0, armpit_y])
        back_pts.append([-hw / 2.0, 0.0])

        # 3. Sleeve Pattern (Symmetrical bell-curve cap to cuff)
        sleeve_bicep = (armhole_depth * 1.85)
        cap_height = armhole_depth * 0.45
        sleeve_pts = []
        # Cuff
        sleeve_pts.append([-cuff_width / 2.0, 0.0])
        sleeve_pts.append([cuff_width / 2.0, 0.0])
        # Underarm right
        sleeve_pts.append([sleeve_bicep / 2.0, sl - cap_height])
        # Bell-shaped cap
        for t in np.linspace(0.0, 1.0, 11):
            ang = t * math.pi
            cx = (sleeve_bicep / 2.0) * math.cos(ang)
            cy = (sl - cap_height) + cap_height * math.sin(ang)
            sleeve_pts.append([cx, cy])
        # Underarm left
        sleeve_pts.append([-sleeve_bicep / 2.0, sl - cap_height])

        # 4. Collar Ribbing Ribbon
        collar_len = nc * 0.90 # 10% tension stretch
        collar_h = 3.0
        collar_pts = [
            [-collar_len / 2.0, 0.0],
            [collar_len / 2.0, 0.0],
            [collar_len / 2.0, collar_h],
            [-collar_len / 2.0, collar_h]
        ]

        # Structure response
        pieces = {
            "front": {"polygon": np.array(front_pts, dtype=np.float32), "panel_type": "front_torso"},
            "back": {"polygon": np.array(back_pts, dtype=np.float32), "panel_type": "back_torso"},
            "sleeve_left": {"polygon": np.array(sleeve_pts, dtype=np.float32), "panel_type": "sleeve"},
            "sleeve_right": {"polygon": np.array(sleeve_pts, dtype=np.float32), "panel_type": "sleeve"},
            "collar": {"polygon": np.array(collar_pts, dtype=np.float32), "panel_type": "collar"}
        }

        seams = [
            {"name": "shoulder_left", "piece_a": "front", "piece_b": "back", "type": "shoulder"},
            {"name": "shoulder_right", "piece_a": "front", "piece_b": "back", "type": "shoulder"},
            {"name": "side_left", "piece_a": "front", "piece_b": "back", "type": "side"},
            {"name": "side_right", "piece_a": "front", "piece_b": "back", "type": "side"},
            {"name": "armhole_left", "piece_a": "sleeve_left", "piece_b": "front", "type": "armhole"},
            {"name": "armhole_right", "piece_a": "sleeve_right", "piece_b": "front", "type": "armhole"},
            {"name": "collar_neck", "piece_a": "collar", "piece_b": "front", "type": "collar"}
        ]

        return {
            "garment_type": "tshirt",
            "spec": spec,
            "pieces": pieces,
            "seams": seams,
            "dimensions": {
                "chest_width_cm": cw,
                "body_length_cm": bl,
                "shoulder_width_cm": sw,
                "sleeve_length_cm": sl,
                "hem_width_cm": hw,
                "neck_circ_cm": nc
            }
        }

    @classmethod
    def _generate_cardigan_pattern(
        cls,
        spec: Dict[str, float],
        res: int
    ) -> Dict[str, Any]:
        """Generates V-neck button-down Cardigan 2D sewing patterns."""
        cw = spec["chest_width_cm"]
        bl = spec["body_length_cm"]
        sw = spec["shoulder_width_cm"]
        sl = spec["sleeve_length_cm"]
        hw = spec["hem_width_cm"]
        nc = spec["neck_circ_cm"]

        shoulder_drop = 3.6
        armhole_depth = min(26.0, 0.38 * bl)
        cuff_width = 12.0 # long sleeve ribbed cuff
        placket_width = 3.2 # front button overlap

        neck_radius_x = (nc / (2.0 * math.pi)) * 1.10
        v_neck_depth = 26.0 # Deep V-neck drop to button placket
        armpit_y = bl - armhole_depth

        # Front Panel (Front Right side - wearer's right)
        # From center front (X=0) to side seam (X=cw/2)
        front_r_pts = [
            [placket_width, 0.0],
            [cw / 2.0, 0.0],
            [cw / 2.0, armpit_y],
        ]
        # Armhole curve
        for t in np.linspace(0.0, 1.0, 8):
            ax = (1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.2 * math.sin(t * math.pi)
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            front_r_pts.append([ax, ay])
        front_r_pts.append([sw / 2.0, bl - shoulder_drop])
        front_r_pts.append([neck_radius_x, bl])
        # V-Neck slope down to center placket
        front_r_pts.append([placket_width, bl - v_neck_depth])
        front_r_pts.append([placket_width, 0.0])

        # Front Panel Left (Mirrored wearer's left)
        front_l_pts = [[-p[0], p[1]] for p in front_r_pts]

        # Back Panel (Full single piece)
        back_pts = []
        back_pts.append([hw / 2.0, 0.0])
        back_pts.append([cw / 2.0, armpit_y])
        for t in np.linspace(0.0, 1.0, 8):
            ax = (1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.2 * math.sin(t * math.pi)
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            back_pts.append([ax, ay])
        back_pts.append([sw / 2.0, bl - shoulder_drop])
        back_pts.append([neck_radius_x, bl])
        for t in np.linspace(0.0, 1.0, 7):
            ang = t * math.pi
            nx = neck_radius_x * math.cos(ang)
            ny = bl - 2.5 * math.sin(ang)
            back_pts.append([nx, ny])
        back_pts.append([-neck_radius_x, bl])
        back_pts.append([-sw / 2.0, bl - shoulder_drop])
        for t in np.linspace(1.0, 0.0, 8):
            ax = -((1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.2 * math.sin(t * math.pi))
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            back_pts.append([ax, ay])
        back_pts.append([-cw / 2.0, armpit_y])
        back_pts.append([-hw / 2.0, 0.0])

        # Long Sleeves (Full wrist length)
        sleeve_bicep = armhole_depth * 1.80
        cap_height = armhole_depth * 0.42
        sleeve_pts = [
            [-cuff_width / 2.0, 0.0],
            [cuff_width / 2.0, 0.0],
            [sleeve_bicep / 2.0, sl - cap_height]
        ]
        for t in np.linspace(0.0, 1.0, 11):
            ang = t * math.pi
            cx = (sleeve_bicep / 2.0) * math.cos(ang)
            cy = (sl - cap_height) + cap_height * math.sin(ang)
            sleeve_pts.append([cx, cy])
        sleeve_pts.append([-sleeve_bicep / 2.0, sl - cap_height])

        pieces = {
            "front_left": {"polygon": np.array(front_l_pts, dtype=np.float32), "panel_type": "front_half"},
            "front_right": {"polygon": np.array(front_r_pts, dtype=np.float32), "panel_type": "front_half"},
            "back": {"polygon": np.array(back_pts, dtype=np.float32), "panel_type": "back_torso"},
            "sleeve_left": {"polygon": np.array(sleeve_pts, dtype=np.float32), "panel_type": "sleeve_long"},
            "sleeve_right": {"polygon": np.array(sleeve_pts, dtype=np.float32), "panel_type": "sleeve_long"}
        }

        seams = [
            {"name": "shoulder_left", "piece_a": "front_left", "piece_b": "back", "type": "shoulder"},
            {"name": "shoulder_right", "piece_a": "front_right", "piece_b": "back", "type": "shoulder"},
            {"name": "side_left", "piece_a": "front_left", "piece_b": "back", "type": "side"},
            {"name": "side_right", "piece_a": "front_right", "piece_b": "back", "type": "side"},
            {"name": "center_placket", "piece_a": "front_left", "piece_b": "front_right", "type": "placket"}
        ]

        return {
            "garment_type": "cardigan",
            "spec": spec,
            "pieces": pieces,
            "seams": seams,
            "dimensions": {
                "chest_width_cm": cw,
                "body_length_cm": bl,
                "shoulder_width_cm": sw,
                "sleeve_length_cm": sl,
                "hem_width_cm": hw,
                "neck_circ_cm": nc
            }
        }

    @classmethod
    def _generate_shirt_pattern(
        cls,
        spec: Dict[str, float],
        res: int
    ) -> Dict[str, Any]:
        """Generates button-down dress/casual shirt 2D sewing patterns with collar and cuffs."""
        cw = spec["chest_width_cm"]
        bl = spec["body_length_cm"]
        sw = spec["shoulder_width_cm"]
        sl = spec["sleeve_length_cm"]
        hw = spec["hem_width_cm"]
        nc = spec["neck_circ_cm"]

        shoulder_drop = 4.2
        armhole_depth = min(25.5, 0.35 * bl)
        cuff_width = 11.5
        placket_width = 2.8
        neck_radius_x = (nc / (2.0 * math.pi)) * 1.08
        armpit_y = bl - armhole_depth

        # Front Right panel
        front_r_pts = [
            [placket_width, 0.0],
            [cw / 2.0, 3.0], # curved shirt hem
            [cw / 2.0, armpit_y]
        ]
        for t in np.linspace(0.0, 1.0, 8):
            ax = (1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.4 * math.sin(t * math.pi)
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            front_r_pts.append([ax, ay])
        front_r_pts.append([sw / 2.0, bl - shoulder_drop])
        front_r_pts.append([neck_radius_x, bl])
        # Collar scoop
        for t in np.linspace(0.0, 1.0, 6):
            nx = (1.0 - t) * neck_radius_x + t * placket_width
            ny = bl - 7.5 * math.sin(t * math.pi * 0.5)
            front_r_pts.append([nx, ny])
        front_r_pts.append([placket_width, 0.0])

        front_l_pts = [[-p[0], p[1]] for p in front_r_pts]

        # Back panel with shirt yoke
        back_pts = []
        back_pts.append([hw / 2.0, 3.5])
        back_pts.append([cw / 2.0, armpit_y])
        for t in np.linspace(0.0, 1.0, 8):
            ax = (1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.4 * math.sin(t * math.pi)
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            back_pts.append([ax, ay])
        back_pts.append([sw / 2.0, bl - shoulder_drop])
        back_pts.append([neck_radius_x, bl])
        for t in np.linspace(0.0, 1.0, 7):
            ang = t * math.pi
            nx = neck_radius_x * math.cos(ang)
            ny = bl - 2.8 * math.sin(ang)
            back_pts.append([nx, ny])
        back_pts.append([-neck_radius_x, bl])
        back_pts.append([-sw / 2.0, bl - shoulder_drop])
        for t in np.linspace(1.0, 0.0, 8):
            ax = -((1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.4 * math.sin(t * math.pi))
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            back_pts.append([ax, ay])
        back_pts.append([-cw / 2.0, armpit_y])
        back_pts.append([-hw / 2.0, 3.5])

        # Sleeves with cuffs
        sleeve_bicep = armhole_depth * 1.75
        cap_h = armhole_depth * 0.45
        sleeve_pts = [
            [-cuff_width / 2.0, 0.0],
            [cuff_width / 2.0, 0.0],
            [sleeve_bicep / 2.0, sl - cap_h]
        ]
        for t in np.linspace(0.0, 1.0, 11):
            ang = t * math.pi
            cx = (sleeve_bicep / 2.0) * math.cos(ang)
            cy = (sl - cap_h) + cap_h * math.sin(ang)
            sleeve_pts.append([cx, cy])
        sleeve_pts.append([-sleeve_bicep / 2.0, sl - cap_h])

        pieces = {
            "front_left": {"polygon": np.array(front_l_pts, dtype=np.float32), "panel_type": "front_half"},
            "front_right": {"polygon": np.array(front_r_pts, dtype=np.float32), "panel_type": "front_half"},
            "back": {"polygon": np.array(back_pts, dtype=np.float32), "panel_type": "back_torso"},
            "sleeve_left": {"polygon": np.array(sleeve_pts, dtype=np.float32), "panel_type": "sleeve_long"},
            "sleeve_right": {"polygon": np.array(sleeve_pts, dtype=np.float32), "panel_type": "sleeve_long"}
        }

        seams = [
            {"name": "shoulder_left", "piece_a": "front_left", "piece_b": "back", "type": "shoulder"},
            {"name": "shoulder_right", "piece_a": "front_right", "piece_b": "back", "type": "shoulder"},
            {"name": "side_left", "piece_a": "front_left", "piece_b": "back", "type": "side"},
            {"name": "side_right", "piece_a": "front_right", "piece_b": "back", "type": "side"},
            {"name": "center_placket", "piece_a": "front_left", "piece_b": "front_right", "type": "placket"}
        ]

        return {
            "garment_type": "shirt",
            "spec": spec,
            "pieces": pieces,
            "seams": seams,
            "dimensions": {
                "chest_width_cm": cw,
                "body_length_cm": bl,
                "shoulder_width_cm": sw,
                "sleeve_length_cm": sl,
                "hem_width_cm": hw,
                "neck_circ_cm": nc
            }
        }

    @classmethod
    def _generate_jacket_pattern(
        cls,
        spec: Dict[str, float],
        res: int
    ) -> Dict[str, Any]:
        """Generates structured outerwear zip/button Jacket 2D sewing patterns."""
        cw = spec["chest_width_cm"]
        bl = spec["body_length_cm"]
        sw = spec["shoulder_width_cm"]
        sl = spec["sleeve_length_cm"]
        hw = spec["hem_width_cm"]
        nc = spec["neck_circ_cm"]

        shoulder_drop = 3.5
        armhole_depth = min(27.0, 0.40 * bl)
        cuff_width = 13.5
        placket_width = 3.0
        neck_radius_x = (nc / (2.0 * math.pi)) * 1.12
        armpit_y = bl - armhole_depth

        # Front Right panel
        front_r_pts = [
            [placket_width, 0.0],
            [cw / 2.0, 0.0],
            [cw / 2.0, armpit_y]
        ]
        for t in np.linspace(0.0, 1.0, 8):
            ax = (1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.0 * math.sin(t * math.pi)
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            front_r_pts.append([ax, ay])
        front_r_pts.append([sw / 2.0, bl - shoulder_drop])
        front_r_pts.append([neck_radius_x, bl])
        for t in np.linspace(0.0, 1.0, 6):
            nx = (1.0 - t) * neck_radius_x + t * placket_width
            ny = bl - 6.0 * math.sin(t * math.pi * 0.5)
            front_r_pts.append([nx, ny])
        front_r_pts.append([placket_width, 0.0])

        front_l_pts = [[-p[0], p[1]] for p in front_r_pts]

        # Back panel
        back_pts = []
        back_pts.append([hw / 2.0, 0.0])
        back_pts.append([cw / 2.0, armpit_y])
        for t in np.linspace(0.0, 1.0, 8):
            ax = (1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.0 * math.sin(t * math.pi)
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            back_pts.append([ax, ay])
        back_pts.append([sw / 2.0, bl - shoulder_drop])
        back_pts.append([neck_radius_x, bl])
        for t in np.linspace(0.0, 1.0, 7):
            ang = t * math.pi
            nx = neck_radius_x * math.cos(ang)
            ny = bl - 2.4 * math.sin(ang)
            back_pts.append([nx, ny])
        back_pts.append([-neck_radius_x, bl])
        back_pts.append([-sw / 2.0, bl - shoulder_drop])
        for t in np.linspace(1.0, 0.0, 8):
            ax = -((1.0 - t) * (cw / 2.0) + t * (sw / 2.0) - 1.0 * math.sin(t * math.pi))
            ay = (1.0 - t) * armpit_y + t * (bl - shoulder_drop)
            back_pts.append([ax, ay])
        back_pts.append([-cw / 2.0, armpit_y])
        back_pts.append([-hw / 2.0, 0.0])

        # Heavy long sleeves
        sleeve_bicep = armhole_depth * 1.90
        cap_h = armhole_depth * 0.40
        sleeve_pts = [
            [-cuff_width / 2.0, 0.0],
            [cuff_width / 2.0, 0.0],
            [sleeve_bicep / 2.0, sl - cap_h]
        ]
        for t in np.linspace(0.0, 1.0, 11):
            ang = t * math.pi
            cx = (sleeve_bicep / 2.0) * math.cos(ang)
            cy = (sl - cap_h) + cap_h * math.sin(ang)
            sleeve_pts.append([cx, cy])
        sleeve_pts.append([-sleeve_bicep / 2.0, sl - cap_h])

        pieces = {
            "front_left": {"polygon": np.array(front_l_pts, dtype=np.float32), "panel_type": "front_half"},
            "front_right": {"polygon": np.array(front_r_pts, dtype=np.float32), "panel_type": "front_half"},
            "back": {"polygon": np.array(back_pts, dtype=np.float32), "panel_type": "back_torso"},
            "sleeve_left": {"polygon": np.array(sleeve_pts, dtype=np.float32), "panel_type": "sleeve_jacket"},
            "sleeve_right": {"polygon": np.array(sleeve_pts, dtype=np.float32), "panel_type": "sleeve_jacket"}
        }

        seams = [
            {"name": "shoulder_left", "piece_a": "front_left", "piece_b": "back", "type": "shoulder"},
            {"name": "shoulder_right", "piece_a": "front_right", "piece_b": "back", "type": "shoulder"},
            {"name": "side_left", "piece_a": "front_left", "piece_b": "back", "type": "side"},
            {"name": "side_right", "piece_a": "front_right", "piece_b": "back", "type": "side"},
            {"name": "center_zip", "piece_a": "front_left", "piece_b": "front_right", "type": "zipper"}
        ]

        return {
            "garment_type": "jacket",
            "spec": spec,
            "pieces": pieces,
            "seams": seams,
            "dimensions": {
                "chest_width_cm": cw,
                "body_length_cm": bl,
                "shoulder_width_cm": sw,
                "sleeve_length_cm": sl,
                "hem_width_cm": hw,
                "neck_circ_cm": nc
            }
        }

