from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import health, tryon, visual_search

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Microservice AI chuyên dụng cho Virtual Try-On (IDM-VTON) và Visual Search (SigLIP + FAISS)"
)

# CORS Policy - Only accept internal requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health.router, prefix="", tags=["System"])
app.include_router(tryon.router, prefix=f"{settings.API_V1_STR}/tryon", tags=["Virtual Try-On"])
app.include_router(visual_search.router, prefix=f"{settings.API_V1_STR}/search", tags=["Visual Search"])

@app.get("/")
def root():
    return {
        "service": settings.PROJECT_NAME,
        "docs": "/docs",
        "health": "/health"
    }
