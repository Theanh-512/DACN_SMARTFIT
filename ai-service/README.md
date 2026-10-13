# Fashion AI Microservice

Dịch vụ suy luận AI chuyên biệt hỗ trợ:
1. **Virtual Try-On (Thử đồ ảo)**: Mô hình IDM-VTON (Diffusion Pipeline kết hợp Human Parsing & OpenPose).
2. **Visual Search (Tìm kiếm bằng hình ảnh)**: Mô hình SigLIP ViT tạo vector embeddings kết hợp chỉ mục FAISS Index.

---

## Cài Đặt & Khởi Chạy Local

```powershell
# 1. Tạo môi trường ảo Python
python -m venv .venv
.venv\Scripts\Activate.ps1

# 2. Cài đặt thư viện
pip install --upgrade pip
pip install -r requirements.txt

# 3. Khởi chạy server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## API Endpoints Nội Bộ
- `GET /health`: Kiểm tra trạng thái service và GPU CUDA.
- `POST /internal/v1/tryon/inference`: Nhận task thử đồ ảo (Header: `X-Internal-Token`).
- `POST /internal/v1/search/visual`: Nhận ảnh query và trả về top-K sản phẩm tương đồng (Header: `X-Internal-Token`).
