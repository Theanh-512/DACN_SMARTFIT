import os
import sys
import unittest
import numpy as np
import trimesh
from scipy.spatial import cKDTree

# Add ml_service root to sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from core.body_model import BodyModel
from core.garment import GarmentGenerator, load_size_chart

class TestPhase4Garment(unittest.TestCase):

    def test_garment_size_chart_loaded(self):
        chart = load_size_chart()
        self.assertIn("sizes", chart)
        for sz in ["S", "M", "L", "XL"]:
            self.assertIn(sz, chart["sizes"])
            self.assertIn("chest_cm", chart["sizes"][sz])
            self.assertIn("waist_cm", chart["sizes"][sz])
            self.assertIn("length_cm", chart["sizes"][sz])
            self.assertIn("shoulder_cm", chart["sizes"][sz])

    def test_parametric_tshirt_generation_independent_of_topology(self):
        bm = BodyModel()
        body_mesh = bm.get_trimesh(pose="a_pose")

        gen = GarmentGenerator()
        g_mesh, info = gen.generate_tshirt(body_mesh, size="M")

        self.assertIsInstance(g_mesh, trimesh.Trimesh)
        self.assertGreater(len(g_mesh.vertices), 500)
        self.assertGreater(len(g_mesh.faces), 500)
        self.assertEqual(info["size"], "M")
        self.assertIn("ease_chest_cm", info)
        self.assertIn("ease_waist_cm", info)

    def test_garment_ease_progression(self):
        bm = BodyModel()
        body_mesh = bm.get_trimesh(pose="a_pose")

        gen = GarmentGenerator()
        eases = {}
        lengths = {}
        for sz in ["S", "M", "L", "XL"]:
            g_mesh, info = gen.generate_tshirt(body_mesh, size=sz)
            eases[sz] = info["ease_chest_cm"]
            lengths[sz] = info["length_cm"]

        # Monotonic increase in chest circumference and garment length
        self.assertLess(eases["S"], eases["M"])
        self.assertLess(eases["M"], eases["L"])
        self.assertLess(eases["L"], eases["XL"])
        self.assertLess(lengths["S"], lengths["M"])
        self.assertLess(lengths["M"], lengths["L"])
        self.assertLess(lengths["L"], lengths["XL"])

    def test_pushout_collision_no_penetration(self):
        bm = BodyModel()
        body_mesh = bm.get_trimesh(pose="a_pose")

        gen = GarmentGenerator()
        # Test on size S (tightest fit)
        g_mesh, info = gen.generate_tshirt(body_mesh, size="S", drape_mode="pushout")

        body_verts = body_mesh.vertices
        body_norms = body_mesh.vertex_normals
        tree = cKDTree(body_verts)

        g_verts = g_mesh.vertices
        dists, idxs = tree.query(g_verts)
        nearest_norms = body_norms[idxs]
        nearest_pts = body_verts[idxs]

        # Signed distance along normal
        proj = np.sum((g_verts - nearest_pts) * nearest_norms, axis=1)

        # Allow slight 1.5mm discretization tolerance
        self.assertTrue(np.all(proj >= 0.003), f"Penetration detected: min proj = {np.min(proj):.4f}m")

    def test_180cm_stature_difference(self):
        bm = BodyModel()
        from core.slider_mapping import SliderMappingEngine
        engine = SliderMappingEngine()
        betas_180 = engine.predict_betas({"height_cm": 180.0, "chest_cm": 95.0})
        tall_body = bm.get_trimesh(betas=betas_180, pose="a_pose")
        tall_h = np.max(tall_body.vertices[:, 1]) - np.min(tall_body.vertices[:, 1])
        self.assertGreaterEqual(tall_h, 1.78)

        gen = GarmentGenerator()
        g_s, info_s = gen.generate_tshirt(tall_body, size="S")
        g_xl, info_xl = gen.generate_tshirt(tall_body, size="XL")

        # Size S on 180cm person has tighter ease than XL
        self.assertLess(info_s["ease_chest_cm"], info_xl["ease_chest_cm"])
        # Hem of S is higher than XL (shorter coverage)
        y_hem_s = np.min(g_s.vertices[:, 1])
        y_hem_xl = np.min(g_xl.vertices[:, 1])
        self.assertGreater(y_hem_s, y_hem_xl)

    def test_tryon_endpoint(self):
        from fastapi.testclient import TestClient
        from app.main import app
        client = TestClient(app)

        payload = {
            "betas": [0.0] * 10,
            "height_cm": 175.0,
            "size": "M",
            "color_hex": "#19284B",
            "drape_mode": "pushout"
        }
        res = client.post("/body/tryon", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["size"], "M")
        self.assertIn("ease_info", data)
        self.assertIn("glb_url", data)
        self.assertTrue(data["glb_url"].endswith("fitted_m.glb"))

if __name__ == "__main__":
    unittest.main()

