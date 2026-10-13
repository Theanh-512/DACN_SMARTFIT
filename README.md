# Fashion AI E-Commerce Monorepo

Nền tảng thương mại điện tử thời trang tích hợp công nghệ AI tiên tiến:
- **Frontend**: Angular 20 (Standalone Components, Signals, Hybrid SSR).
- **Backend Core**: ASP.NET Core 9 Web API (Clean Architecture, EF Core, SQL Server 2022).
- **AI Microservice**: Python FastAPI (PyTorch, IDM-VTON Virtual Try-On, SigLIP + FAISS Visual Search).
- **Hạ tầng**: Docker Compose (SQL Server, Redis, MinIO S3).

---

## Cấu Trúc Monorepo

```text
fashion-ai-ecommerce/
├── apps/
│   ├── web-angular/         # Ứng dụng Frontend Angular 20
│   └── api-dotnet/          # Backend Web API ASP.NET Core 9 (Clean Architecture)
├── services/
│   └── ai-service/          # Microservice AI FastAPI (IDM-VTON & SigLIP + FAISS)
├── infra/                   # Docker compose & cấu hình hạ tầng
├── docs/                    # Tài liệu kiến trúc, API contracts, Database, AI metrics
├── scripts/                 # PowerShell scripts tự động hóa build & test
├── .env.example             # Biến môi trường mẫu
└── ARCHITECTURE.md          # Chi tiết thiết kế kiến trúc toàn hệ thống
```

---

## Hướng Dẫn Khởi Chạy Nhanh

### 1. Khởi chạy hạ tầng dữ liệu
```powershell
docker compose -f infra/docker-compose.yml up -d
```

### 2. Khởi chạy Backend ASP.NET Core
```powershell
dotnet run --project apps/api-dotnet/src/FashionAI.Api
```

### 3. Khởi chạy AI Service FastAPI
```powershell
python -m venv services/ai-service/.venv
services/ai-service/.venv/Scripts/Activate.ps1
pip install -r services/ai-service/requirements.txt
uvicorn app.main:app --app-dir services/ai-service --host 0.0.0.0 --port 8000 --reload
```

### 4. Khởi chạy Frontend Angular
```powershell
npm --prefix apps/web-angular start
```

---

## Lệnh Build & Test Toàn Hệ Thống

```powershell
# Chạy toàn bộ build
./scripts/build-all.ps1

# Chạy toàn bộ unit tests
./scripts/test-all.ps1
```
