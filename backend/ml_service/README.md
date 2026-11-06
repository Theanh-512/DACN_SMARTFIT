# FashionAI ML Service

Microservice cung cấp mô hình cơ thể người 3D tham số (**SMPL / SMPL-X**), trích xuất số đo nhân trắc học may mặc ISO 8559, Virtual Try-On và đánh giá độ vừa (Fit Advisor).

---

## 1. Mô hình Hiện tại & Lưu ý Bản quyền (License Notice)

> [!IMPORTANT]
> **Mô hình Đang Sử dụng (Active Body Model):**
> - **SMPL v1.1.0 (6,890 đỉnh, 13,776 mặt)**: Đã tích hợp đầy đủ 3 bộ trọng số giới tính: **NEUTRAL**, **MALE**, và **FEMALE** tại `assets/smpl/` và `assets/smplx/`.
> - **Hỗ trợ Đa mô hình**: Lớp `BodyModel` hỗ trợ cả hai loại qua biến môi trường `BODY_MODEL=smpl|smplx` (tự động nhận diện).
>
> **Giấy phép Nghiên cứu Phi thương mại (Non-commercial Scientific Research License):**
> - **SMPL & SMPL-X**: Thuộc Max-Planck-Gesellschaft zur Förderung der Wissenschaften e.V. (MPG) / Max Planck Institute for Intelligent Systems.
> - **Mục đích sử dụng**: Các file trọng số mô hình chỉ được cấp phép cho mục đích nghiên cứu học thuật, giáo dục và phi thương mại. Nghiêm cấm phân phối thương mại khi chưa có thỏa thuận thương quyền với Max Planck Institute. Chi tiết xem tại [SMPL Model License](https://smpl.is.tue.mpg.de/modellicense.html) và [SMPL-X License](https://smpl-x.is.tue.mpg.de/license.html).
> - **THuman2.1 Dataset**: Bộ dữ liệu scan người 3D thuộc Tsinghua University, chỉ dùng cho nghiên cứu phi thương mại.
>
> **Thực nghiệm Khoa học Phase 3.5:**
> - Mô hình 3D thực nghiệm hiện tại đã chạy trên topology thật của SMPL (6,890 đỉnh).
> - Các file trọng số `.pkl` nguyên bản đã được chuyển sang định dạng `.npz` nén thông qua `scripts/convert_smpl_pkl_to_npz.py` (sử dụng shim đọc pickle, giảm 84% kích thước từ ~247MB xuống ~37.7MB, không cần cài đặt chumpy).
> - Script `scripts/rebuild_assets.py` đã trích xuất số đo từ không gian PCA CAESAR thật và huấn luyện mô hình hồi quy Ridge / MLP cho toàn bộ 10 tham số betas.

---

## 2. Hướng dẫn Môi trường Python 3.10 / 3.11 & CUDA cho GTX 1650 Ti

### A. Cài đặt Python 3.10 trên Windows
Do một số thư viện Computer Vision / PyTorch C++ extensions chưa hỗ trợ hoàn toàn Python 3.14, khuyến nghị tạo môi trường ảo bằng **Python 3.10 hoặc 3.11**:

1. Tải bản cài đặt chính thức: [Python 3.10.11 Windows 64-bit Installer](https://www.python.org/ftp/python/3.10.11/python-3.10.11-amd64.exe)
   *(Lưu ý tick chọn checkbox **"Add Python to PATH"** khi cài đặt)*.
   Hoặc chạy lệnh PowerShell (chạy bằng quyền Administrator):
   ```powershell
   winget install Python.Python.3.10
   ```
2. Khởi tạo virtual environment riêng cho `ml_service`:
   ```powershell
   py -3.10 -m venv d:\DoAnCoSo\DOANCHUYENNGANH\DACN_SMARTFIT\backend\ml_service\.venv
   .\backend\ml_service\.venv\Scripts\Activate.ps1
   pip install -r backend\ml_service\requirements.txt
   ```

### B. Hỗ trợ GPU NVIDIA GeForce GTX 1650 Ti (4GB VRAM)
- Để kích hoạt GPU với CUDA 12.1:
  ```powershell
  pip install torch torchvision --index-url https://download.pytorch.org/whl/cu121
  ```
- Biến môi trường cấu hình thiết bị trong `.env`:
  ```ini
  DEVICE=cuda   # hoặc 'cpu' (mặc định tự động nhận diện)
  ```
- **Cơ chế Fallback thông minh:** `BodyEstimator` được tích hợp `DeviceManager`. Nếu GPU bị tràn bộ nhớ (`torch.cuda.OutOfMemoryError`), hệ thống tự động giải phóng cache GPU và chuyển tức thì sang CPU inference mà không làm gián đoạn request.

---

## 3. So sánh Các Model Ước lượng Ảnh → SMPL-X (Phase 2 Model Selection)

Dựa trên cấu hình phần cứng **GTX 1650 Ti 4GB VRAM** và môi trường **Windows**:

| Tiêu chí | Lựa chọn 1: MediaPipe/Focused Regression (Khuyến nghị) | Lựa chọn 2: CameraHMR / BEDLAM-CLIFF | Lựa chọn 3: SMPLer-X / OSX |
| :--- | :--- | :--- | :--- |
| **Kích thước file** | ~25 MB | ~200 – 350 MB | ~800 MB – 1.5 GB |
| **Mức tiêu thụ VRAM** | < 0.5 GB (Rất nhẹ) | ~1.8 – 2.5 GB (Vừa vặn) | ~3.8 – 4.5 GB (Dễ tràn VRAM) |
| **Độ khó cài trên Windows** | **Rất dễ** (100% pure pip, không cần compiler) | **Trung bình** (Cần PyTorch CUDA + crop detector) | **Khó** (Yêu cầu MMCV / DCNv3 / MSVC build tools) |
| **Tốc độ xử lý** | Siêu nhanh (< 0.2s / ảnh) | Nhanh (~ 1.5s / ảnh) | Chậm hơn (~ 3.5s – 5s / ảnh) |
| **Độ ổn định trên GPU 4GB** | Hoàn hảo, không bao giờ OOM | Tốt khi batch=1 | Dễ gặp CUDA Out-Of-Memory |

---

## 4. Quyền Riêng tư & Bảo mật Ảnh Người dùng

> [!CAUTION]
> **Chính sách Không Lưu trữ Ảnh:**
> - Ảnh người dùng gửi lên `POST /body/estimate` chỉ được xử lý tạm thời trong bộ nhớ / thư mục đệm.
> - Bắt buộc người dùng phải tick chọn xác nhận điều khoản riêng tư (`privacy_agreed = true`).
> - Ngay sau khi ước lượng xong vector `betas` và số đo, các file ảnh tạm **bị xóa vĩnh viễn ngay lập tức** trong khối `finally`, không lưu trữ ảnh trên đĩa máy chủ.

---

## 5. Hướng dẫn Chuyển đổi và Nạp Trọng số SMPL / SMPL-X

1. Đặt các file gốc `.pkl` vào `SMPL_python_v.1.1.0/smpl/models/` hoặc `backend/ml_service/assets/smpl/`.
2. Chạy chuyển đổi sang định dạng `.npz` nén:
   ```powershell
   python backend/ml_service/scripts/convert_smpl_pkl_to_npz.py
   ```
3. Chạy cập nhật toàn bộ assets và GLB client-side:
   ```powershell
   python backend/ml_service/scripts/rebuild_assets.py
   ```
4. Kiểm tra xác nhận tự động:
   ```powershell
   python backend/ml_service/tests/test_official_smplx.py
   ```

---

## 6. Chạy Kiểm Thử Toàn Diện (Unit Tests)

```powershell
# Chạy toàn bộ test suite (Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5)
python -m pytest backend/ml_service/tests -v
```

Danh sách các bài kiểm thử:
- `test_phase1.py`: Kiểm tra API health check, fallback an toàn khi thiếu file trọng số, baseline betas=0 và tính đơn điệu của beta[0].
- `test_phase2.py`: Kiểm định ảnh đầu vào, xóa sạch ảnh tạm theo chính sách riêng tư, hợp nhất ảnh đa góc và chuẩn hóa chiều cao.
- `test_phase3.py`: Kiểm định topology thật (6,890 đỉnh / 13,776 mặt cho SMPL), chiều cao baseline 1.6m - 1.8m, tính đơn điệu của hình thái cơ thể, R² trọng số slider mapping và xuất GLB morph targets.
- `test_phase3_6.py`: Kiểm định skeleton 24 khớp SMPL, skin weight normalization, sparse J-regressor cập nhật động khi betas đổi, 6 regional morphs Gaussian falloff, preset dạng người, lớp đồ lót nền 2-3mm offset.
- `test_phase4.py`: Kiểm định sinh trang phục tham số T-shirt, tính va chạm pushout không đâm xuyên da và gợi ý size.
- `test_phase5.py`: **Phase 5 Fit Advisor** — số đo trực tiếp trên mesh áo (không từ bảng size), heatmap khoảng cách đỉnh áo tới thân, phân loại fit (tight/perfect/loose) theo vùng, gợi ý size đúng hướng, confidence không hardcode.
