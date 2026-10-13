# API Contracts Specification

Quy chuẩn giao tiếp REST API giữa Frontend Angular, Backend ASP.NET Core và AI Microservice FastAPI.

---

## 1. Public API (Angular <-> ASP.NET Core)
- `POST /api/v1/auth/login`: Xác thực người dùng, trả về JWT token.
- `GET /api/v1/catalog/products`: Lấy danh sách sản phẩm (hỗ trợ phân trang, lọc size/màu/giá).
- `GET /api/v1/catalog/products/{slug}`: Chi tiết sản phẩm kèm danh sách biến thể SKU.
- `POST /api/v1/catalog/visual-search`: Tìm kiếm sản phẩm tương tự bằng hình ảnh.
- `POST /api/v1/cart/items`: Thêm sản phẩm vào giỏ hàng.
- `POST /api/v1/orders/checkout`: Tạo đơn hàng và thanh toán.
- `POST /api/v1/try-on/tasks`: Khởi tạo tác vụ thử đồ ảo (nhận `taskId`).
- `GET /api/v1/try-on/tasks/{taskId}`: Tra cứu trạng thái tác vụ thử đồ.

---

## 2. Internal API (ASP.NET Core <-> FastAPI)
- `GET /health`: Healthcheck trạng thái GPU CUDA.
- `POST /internal/v1/tryon/inference`: Gọi suy luận mô hình IDM-VTON.
- `POST /internal/v1/search/visual`: Trích xuất vector embedding SigLIP và tìm kiếm K-NN qua FAISS.
- Yêu cầu Header: `X-Internal-Token: <SECRET_KEY>`.
