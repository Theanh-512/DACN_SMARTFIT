"""
Setup Script for CameraHMR Vendor Dependency
=============================================
Clones the official CameraHMR repository at a pinned commit hash into
backend/ml_service/vendor/CameraHMR without storing third-party code in the main Git repository.
"""

import os
import sys
import subprocess

REPO_URL = "https://github.com/pixelite1201/CameraHMR.git"
PINNED_COMMIT = "65d11a0640d23c60f55ec82ae54298e9e7e549e0"

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
VENDOR_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "vendor")
TARGET_DIR = os.path.join(VENDOR_DIR, "CameraHMR")


def setup_camerahmr():
    os.makedirs(VENDOR_DIR, exist_ok=True)
    if not os.path.exists(TARGET_DIR):
        print(f"[SETUP] Cloning CameraHMR repository from {REPO_URL}...")
        subprocess.check_call(["git", "clone", REPO_URL, TARGET_DIR])
    else:
        print(f"[SETUP] Repository already exists at {TARGET_DIR}.")

    print(f"[SETUP] Checking out pinned commit: {PINNED_COMMIT}...")
    subprocess.check_call(["git", "-C", TARGET_DIR, "checkout", PINNED_COMMIT])
    print("[SETUP] CameraHMR vendor dependency successfully verified.")


if __name__ == "__main__":
    setup_camerahmr()

