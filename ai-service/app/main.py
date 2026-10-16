from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, tryon, visual_search, sizing, avatar

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Microservice AI chuyên dụng cho 3D Avatar (SMPL-X ISO 8559), Virtual Try-On, Visual Search và Size Recommendation"
)

# CORS Policy - Only accept internal requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
from fastapi.staticfiles import StaticFiles

# Include Routers with both internal/v1 and public api/v1 paths
app.include_router(health.router, prefix="", tags=["System"])
for pfx in [settings.API_V1_STR, "/api/v1"]:
    app.include_router(avatar.router, prefix=f"{pfx}/avatar", tags=["3D Avatar & ISO 8559 Anthropometry"])
    app.include_router(tryon.router, prefix=f"{pfx}/tryon", tags=["Virtual Try-On"])
    app.include_router(visual_search.router, prefix=f"{pfx}/search", tags=["Visual Search"])
    app.include_router(sizing.router, prefix=f"{pfx}/sizing", tags=["Size Recommendation"])

# Mount static results directory
results_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "results")
os.makedirs(results_dir, exist_ok=True)
app.mount("/results", StaticFiles(directory=results_dir), name="results")

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "health": "/health"
    }
