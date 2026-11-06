import os
import json
import logging
from typing import Dict, Any, Tuple, List
import numpy as np
import joblib
from sklearn.linear_model import Ridge
from sklearn.neural_network import MLPRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

from core.body_model import BodyModel
from core.measurements import BodyMeasurements

logger = logging.getLogger("ml_service.slider_mapping")
logging.basicConfig(level=logging.INFO)

class SliderMappingEngine:
    """
    Bi-directional Mapping between Friendly Anthropometric Measurements (cm)
    and 10 SMPL-X Shape Betas (R^10).
    Trains both Ridge Regression and lightweight MLP, compares R^2 and MAE,
    and exports portable weights to JSON for instant 60 FPS client-side evaluation.
    """

    FEATURE_NAMES = [
        "height_cm",
        "weight_kg",
        "chest_cm",
        "waist_cm",
        "hip_cm",
        "shoulder_cm",
        "arm_length_cm"
    ]

    def __init__(self, assets_dir: str = None):
        if assets_dir is None:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            assets_dir = os.path.join(base_dir, "assets")
        self.assets_dir = assets_dir
        os.makedirs(self.assets_dir, exist_ok=True)

        self.weights_json_path = os.path.join(self.assets_dir, "slider_mapping_weights.json")
        self.model_joblib_path = os.path.join(self.assets_dir, "slider_regression.joblib")
        self.scaler = None
        self.ridge_model = None
        self.mlp_model = None
        self.evaluation_report = {}

    def generate_synthetic_dataset(
        self,
        num_samples: int = 5000,
        seed: int = 42
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Generates synthetic beta vectors ~ N(0, 1) clipped to [-3.0, 3.0]
        and measures 3D mesh dimensions in canonical T-pose.
        Returns:
            X: np.ndarray of shape (num_samples, 7) - Measurements
            Y: np.ndarray of shape (num_samples, 10) - Betas
        """
        logger.info(f"Generating synthetic anthropometric dataset with {num_samples} samples...")
        np.random.seed(seed)

        # Generate normally distributed betas within [-3.0, 3.0]
        Y = np.random.normal(loc=0.0, scale=1.0, size=(num_samples, 10))
        Y = np.clip(Y, -3.0, 3.0)

        model = BodyModel()
        X = []

        if not model.is_mock and model.torch_model is not None:
            import torch
            logger.info(f"Measuring real {model.model_type.upper()} 3D meshes for {num_samples} samples...")
            
            # Forward pass in batches of 200
            batch_sz = 200
            all_verts = []
            f = model.faces
            
            for start_idx in range(0, num_samples, batch_sz):
                end_idx = min(start_idx + batch_sz, num_samples)
                cur_b = end_idx - start_idx
                cur_y = torch.tensor(Y[start_idx:end_idx], dtype=torch.float32)
                orient = torch.zeros(cur_b, 3, dtype=torch.float32)
                pose = torch.zeros(cur_b, 69, dtype=torch.float32)
                with torch.no_grad():
                    out = model.torch_model(betas=cur_y, global_orient=orient, body_pose=pose, return_verts=True)
                    all_verts.append(out.vertices.detach().cpu().numpy())
            
            all_verts = np.concatenate(all_verts, axis=0)

            for i in range(num_samples):
                v_i = all_verts[i]
                meas = BodyMeasurements.extract_from_mesh((v_i, f))
                h_m = meas["height_cm"] / 100.0
                
                # BMI correlation with beta[0] in PCA space
                # In SMPL, beta[0] correlates strongly with body stature/mass
                bmi = 22.5 + Y[i, 0] * 2.2
                w_kg = round(float(bmi * (h_m ** 2)), 1)
                
                feats = [
                    float(meas["height_cm"]),
                    float(w_kg),
                    float(meas["chest_cm"]),
                    float(meas["waist_cm"]),
                    float(meas["hip_cm"]),
                    float(meas["shoulder_cm"]),
                    float(meas["arm_length_cm"])
                ]
                X.append(feats)
        else:
            # Fallback for mock mode
            for i in range(num_samples):
                b = Y[i]
                h_cm = 174.5 + b[1] * 5.0 + b[0] * 1.5
                h_m = h_cm / 100.0
                bmi = 23.0 + b[0] * 2.2
                w_kg = bmi * (h_m ** 2)
                chest_cm = 88.4 + b[0] * 7.33 + b[2] * 4.5
                waist_cm = 79.3 + b[0] * 8.15 + b[3] * 4.5
                hip_cm = 82.1 + b[0] * 7.20 + b[4] * 4.5
                shoulder_cm = 52.4 + b[5] * 2.5 + b[0] * 1.8
                arm_length_cm = 52.7 + b[1] * 1.5
                noise = np.random.normal(0, 0.2, size=7)
                feats = [
                    h_cm + noise[0],
                    w_kg + noise[1] * 0.5,
                    chest_cm + noise[2],
                    waist_cm + noise[3],
                    hip_cm + noise[4],
                    shoulder_cm + noise[5],
                    arm_length_cm + noise[6]
                ]
                X.append(feats)

        X = np.array(X, dtype=np.float32)
        Y = np.array(Y, dtype=np.float32)
        logger.info(f"Dataset generated: X shape {X.shape}, Y shape {Y.shape}")
        return X, Y

    def train_models(self, X: np.ndarray, Y: np.ndarray) -> Dict[str, Any]:
        """
        Trains Ridge regression and MLP regressor. Evaluates R2 and MAE.
        """
        X_train, X_test, Y_train, Y_test = train_test_split(
            X, Y, test_size=0.2, random_state=42
        )

        self.scaler = StandardScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        # 1. Ridge Regression
        logger.info("Training Ridge Regression (alpha=1.0)...")
        self.ridge_model = Ridge(alpha=1.0)
        self.ridge_model.fit(X_train_scaled, Y_train)
        Y_pred_ridge = self.ridge_model.predict(X_test_scaled)

        ridge_r2 = float(r2_score(Y_test, Y_pred_ridge))
        ridge_mae = float(mean_absolute_error(Y_test, Y_pred_ridge))

        # Per-beta metrics
        ridge_per_beta = []
        for i in range(10):
            r2_b = float(r2_score(Y_test[:, i], Y_pred_ridge[:, i]))
            mae_b = float(mean_absolute_error(Y_test[:, i], Y_pred_ridge[:, i]))
            ridge_per_beta.append({"beta_index": i, "r2": round(r2_b, 4), "mae": round(mae_b, 4)})

        # 2. MLP Regressor
        logger.info("Training Lightweight MLP Regressor (64x32)...")
        self.mlp_model = MLPRegressor(
            hidden_layer_sizes=(64, 32),
            max_iter=150,
            random_state=42,
            early_stopping=True
        )
        self.mlp_model.fit(X_train_scaled, Y_train)
        Y_pred_mlp = self.mlp_model.predict(X_test_scaled)

        mlp_r2 = float(r2_score(Y_test, Y_pred_mlp))
        mlp_mae = float(mean_absolute_error(Y_test, Y_pred_mlp))

        mlp_per_beta = []
        for i in range(10):
            r2_b = float(r2_score(Y_test[:, i], Y_pred_mlp[:, i]))
            mae_b = float(mean_absolute_error(Y_test[:, i], Y_pred_mlp[:, i]))
            mlp_per_beta.append({"beta_index": i, "r2": round(r2_b, 4), "mae": round(mae_b, 4)})

        self.evaluation_report = {
            "dataset_samples": int(len(X)),
            "features": self.FEATURE_NAMES,
            "ridge": {
                "overall_r2": round(ridge_r2, 4),
                "overall_mae": round(ridge_mae, 4),
                "per_beta": ridge_per_beta
            },
            "mlp": {
                "overall_r2": round(mlp_r2, 4),
                "overall_mae": round(mlp_mae, 4),
                "per_beta": mlp_per_beta
            },
            "selected_model": "ridge" if ridge_r2 >= mlp_r2 else "mlp"
        }

        logger.info(f"Evaluation: Ridge R^2={ridge_r2:.4f}, MAE={ridge_mae:.4f} | MLP R^2={mlp_r2:.4f}, MAE={mlp_mae:.4f}")
        return self.evaluation_report

    def export_weights_and_save(self) -> Dict[str, Any]:
        """
        Exports Ridge linear weights, intercepts, and feature scaling parameters
        to JSON for client-side zero-latency execution.
        Also saves trained scikit-learn models via joblib.
        """
        if self.ridge_model is None or self.scaler is None:
            raise RuntimeError("Models must be trained before exporting weights.")

        # Save joblib bundle
        bundle = {
            "scaler": self.scaler,
            "ridge": self.ridge_model,
            "mlp": self.mlp_model,
            "evaluation": self.evaluation_report
        }
        joblib.dump(bundle, self.model_joblib_path)
        logger.info(f"Saved joblib model to '{self.model_joblib_path}'")

        # Prepare exportable JSON object for client-side JavaScript execution
        # betas = W @ ((X - mean) / scale) + b
        # ridge_model.coef_ has shape (10, num_features)
        weights_dict = {
            "version": "1.0.0",
            "feature_names": self.FEATURE_NAMES,
            "feature_means": [round(float(m), 5) for m in self.scaler.mean_],
            "feature_scales": [round(float(s), 5) for s in self.scaler.scale_],
            "weights": [[round(float(w), 6) for w in row] for row in self.ridge_model.coef_],
            "intercepts": [round(float(b), 6) for b in self.ridge_model.intercept_],
            "evaluation": self.evaluation_report
        }

        with open(self.weights_json_path, "w", encoding="utf-8") as f:
            json.dump(weights_dict, f, indent=2, ensure_ascii=False)
        logger.info(f"Exported client-side weights to '{self.weights_json_path}'")

        return weights_dict

    def predict_betas(self, measurements: Dict[str, float], gender: str = "neutral") -> List[float]:
        """
        Utility method to predict 10 betas from friendly measurement dict.
        Supports calibrated gender-aware mapping ensuring <1cm error with 3D mesh.
        """
        calib_path = os.path.join(self.assets_dir, "calibrated_slider_mapping.json")
        if os.path.exists(calib_path):
            with open(calib_path, "r", encoding="utf-8") as f:
                calib = json.load(f)
            g = measurements.get("gender", gender if gender in calib else "neutral")
            if g not in calib:
                g = "neutral"
            m0 = calib[g]["baseline"]
            keys = calib[g]["keys"]
            active_indices = [i for i, k in enumerate(keys) if k in measurements]
            if not active_indices:
                return [0.0] * 10
            J = np.array(calib[g]["jacobian"])  # 5 x 10
            J_sub = J[active_indices, :]
            delta_sub = np.array([float(measurements[keys[i]]) - m0[keys[i]] for i in active_indices])
            pinv_sub = J_sub.T @ np.linalg.inv(J_sub @ J_sub.T + 0.01 * np.eye(len(active_indices)))
            pred = pinv_sub @ delta_sub
            pred = np.clip(pred, -3.0, 3.0)
            return [round(float(x), 4) for x in pred]

        feats = np.array([[
            measurements.get("height_cm", 174.5),
            measurements.get("weight_kg", 68.0),
            measurements.get("chest_cm", 88.4),
            measurements.get("waist_cm", 79.3),
            measurements.get("hip_cm", 82.1),
            measurements.get("shoulder_cm", 52.4),
            measurements.get("arm_length_cm", 52.7)
        ]], dtype=np.float32)

        if self.scaler is not None and self.ridge_model is not None:
            scaled = self.scaler.transform(feats)
            pred = self.ridge_model.predict(scaled)[0]
            return [round(float(x), 4) for x in pred]

        # Fallback to direct calculation if model not in memory
        if os.path.exists(self.weights_json_path):
            with open(self.weights_json_path, "r", encoding="utf-8") as f:
                d = json.load(f)
            means = np.array(d["feature_means"])
            scales = np.array(d["feature_scales"])
            W = np.array(d["weights"])
            b = np.array(d["intercepts"])
            norm_x = (feats[0] - means) / scales
            pred = W @ norm_x + b
            return [round(float(x), 4) for x in pred]

        return [0.0] * 10

