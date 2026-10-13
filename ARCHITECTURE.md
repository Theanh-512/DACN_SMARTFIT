# Fashion AI E-Commerce Architecture

Hệ thống Thương Mại Điện Tử Thời Trang Tích Hợp Thử Đồ Ảo (IDM-VTON) và Tìm Kiếm Bằng Hình Ảnh (SigLIP + FAISS).

---

## 1. Tổng Quan Kiến Trúc (High-Level Architecture)

```text
[Angular 20 Frontend]  (Port 4200)
       |
       | HTTPS / REST & SignalR
       v
[ASP.NET Core 9 Web API]  (Port 5000 / 5001) - BFF & Enterprise Core
  ├── Application Layer (MediatR / Clean Architecture)
  ├── Domain Layer (Entities: Products, Orders, TryOnTasks, Cart)
  └── Infrastructure (EF Core, JWT, S3 Presigned URLs)
       |
       +---> [SQL Server 2022] (Port 1433) - Dữ liệu nghiệp vụ ACID
       +---> [Redis] (Port 6379) - Cache & SignalR Backplane
       +---> [MinIO / S3] (Port 9000) - Lưu trữ ảnh sản phẩm & ảnh thử đồ
       |
       | Internal HTTP (Private Network)
       v
[Python FastAPI AI Service]  (Port 8000) - GPU / Inference Engine
  ├── Virtual Try-On: IDM-VTON Diffusion Pipeline
  └── Visual Search: SigLIP Embeddings + FAISS Vector Index
```

---

## 2. Phân Định Trách Nhiệm (Separation of Concerns)

1. **Angular (`apps/web-angular`)**:
   - Giao diện người dùng: Catalog, PDP, Giỏ hàng, Đặt hàng, UI Thử đồ ảo, UI Tìm kiếm ảnh.
   - Quản lý trạng thái bằng Angular Signals.
   - Hybrid SSR: Prerender SEO cho Catalog/Sản phẩm, Client render cho Cart, Checkout, Try-On, Account.

2. **ASP.NET Core Web API (`apps/api-dotnet`)**:
   - Nguồn chân lý duy nhất (Single Source of Truth) về Sản phẩm, Biến thể (Size/Màu), Giá, Kho, Đơn hàng.
   - Xác thực & Phân quyền (JWT, Role-based Customer/Admin).
   - Quản lý hàng đợi tác vụ AI (Try-on tasks) và push tiến độ qua SignalR.
   - Cấp phát Presigned URL có thời hạn cho ảnh riêng tư.

3. **FastAPI AI Service (`services/ai-service`)**:
   - Xử lý tác vụ nặng tính toán GPU.
   - Thử đồ ảo: OpenPose/DensePose -> IDM-VTON -> Kết quả.
   - Tìm kiếm ảnh: SigLIP ViT trích xuất 768-dim vector -> FAISS K-NN Search.

4. **Hạ Tầng (`infra/`)**:
   - Docker Compose điều phối SQL Server, Redis, MinIO, Nginx.
