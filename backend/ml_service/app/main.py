import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure root package path is visible
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.routers import health, body, garment, fit

app = FastAPI(
    title="Fashion AI ML Service",
    description="3D Human Parametric Modeling (SMPL-X), ISO 8559 Anthropometry & Virtual Fitting Engine",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router)
app.include_router(body.router)
app.include_router(garment.router)
app.include_router(fit.router)

@app.get("/")
def root():
    return {
        "service": "Fashion AI ML Service",
        "docs": "/docs",
        "health": "/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8001, reload=True)
