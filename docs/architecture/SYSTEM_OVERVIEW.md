# System Overview & Component Interactions

Hệ thống Fashion AI E-Commerce được xây dựng theo mô hình phân tầng hướng dịch vụ (Service-Oriented Monorepo Architecture) nhằm đảm bảo hiệu năng cao, mở rộng linh hoạt và bảo mật dữ liệu.

---

## 1. Các Khối Hệ Thống Chính
1. **Frontend Tier (`apps/web-angular`)**:
   - Angular 20 Standalone Components với tín hiệu reactive Signals.
   - Quản lý trạng thái mua sắm và luồng tương tác thử đồ.
2. **Backend Gateway Tier (`apps/api-dotnet`)**:
   - ASP.NET Core 9 Web API theo kiến trúc Clean Architecture.
   - Đảm nhận toàn bộ nghiệp vụ ACID, xác thực JWT, bảo vệ AI Service nội bộ.
3. **AI Inference Tier (`services/ai-service`)**:
   - Python FastAPI điều khiển phần cứng GPU.
   - Thử đồ ảo IDM-VTON và Tìm kiếm ảnh SigLIP + FAISS.
4. **Hạ Tầng Dữ Liệu (`infra/`)**:
   - SQL Server 2022 (Dữ liệu quan hệ sản phẩm, đơn hàng).
   - Redis 7 (Cache & SignalR state).
   - MinIO S3 (Lưu trữ ảnh catalog và ảnh người dùng).
