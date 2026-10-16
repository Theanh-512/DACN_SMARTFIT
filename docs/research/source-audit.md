# BÁO CÁO THẨM ĐỊNH MÃ NGUỒN & PHÂN TÍCH KHOẢNG TRỐNG KỸ THUẬT
## Dự án: Nền tảng Thương mại Điện tử Thời trang Tích hợp AI (SmartFit Fashion AI)
**Ngày thẩm định**: 16/10/2026  
**Vai trò thẩm định**: Kỹ sư AI cao cấp, Kỹ sư nghiên cứu & Kiến trúc sư hệ thống phần mềm  

---

## 1. TỔNG QUAN HỆ THỐNG MÃ NGUỒN HIỆN CÓ

Dự án SmartFit được thiết kế theo mô hình kiến trúc phân tán phục vụ thương mại điện tử thời trang kết hợp trí tuệ nhân tạo, bao gồm các khối thành phần chính:

```
DACN_SMARTFIT/
├── frontend/fashion-ai-web/     # Ứng dụng Web Single Page Application (Angular 20, SCSS)
├── backend/FashionAI.Backend/    # Web API (.NET 9 C# Clean Architecture)
├── ai-service/                   # Microservice suy luận AI chuyên biệt (Python, FastAPI)
├── IDM-VTON-main/               # Mã nguồn nghiên cứu gốc của mô hình thử đồ ảo IDM-VTON
├── docs/supabase_vton_schema/    # Lược đồ cơ sở dữ liệu PostgreSQL Supabase & dữ liệu mẫu
└── scripts/                      # Kịch bản tự động hóa kiểm thử và xây dựng hệ thống
```

---

## 2. KẾT QUẢ THẨM ĐỊNH TỪNG PHÂN HỆ VÀ KHOẢNG TRỐNG KỸ THUẬT (TECHNICAL GAPS)

### 2.1. Phân hệ Thử đồ ảo (Virtual Try-On - VTON)
* **Hiện trạng trong kho mã nguồn**:
  - Thư mục `IDM-VTON-main/` chứa toàn bộ mã nguồn của nghiên cứu IDM-VTON (Improving Diffusion Models for Authentic Virtual Try-on trong môi trường PyTorch, Diffusers SDXL Inpainting, IP-Adapter, DensePose, OpenPose, Human Parsing).
  - Microservice `ai-service/app/api/routes/tryon.py` đã khai báo endpoint `POST /internal/v1/tryon/inference`.
* **Khoảng trống kỹ thuật thực tế (Gaps)**:
  - **Mô phỏng giả lập (Simulation)**: Trong `tryon.py`, mã nguồn chỉ trả về chính `payload.person_image_url` với độ trễ tính toán giả định, hoàn toàn chưa có đường ống kết nối tới mô hình.
  - **Thiếu kiểm định chất lượng đầu vào (Input Validation)**: Người dùng tải lên ảnh bất kỳ (ảnh mờ, ảnh quá tối, ảnh chụp phong cảnh không có người, hoặc ảnh sai tỷ lệ khung hình) đều không bị chặn trước khi đẩy vào suy luận. Trong mô hình Diffusion, việc suy luận trên ảnh lỗi gây lãng phí từ 10 - 30 giây tính toán GPU và tạo ra dị tật thị giác (artifacts).
  - **Thiếu cơ chế điều phối tác vụ (Job Orchestration)**: Không có cơ chế quản lý trạng thái luồng (`QUEUED`, `VALIDATING`, `PREPROCESSING`, `INFERENCING`, `POSTPROCESSING`, `SUCCEEDED`, `FAILED`), không có định danh tác vụ có thể theo vết (`task_id`), và không đo đạc thời gian thực thi từng giai đoạn.
  - **Ràng buộc tài nguyên tính toán**: Mô hình IDM-VTON SDXL yêu cầu bộ nhớ GPU tối thiểu 16GB - 24GB VRAM. Trên các môi trường kiểm thử không có card đồ họa chuyên dụng, hệ thống bị treo hoặc sập vì tràn bộ nhớ (Out-of-Memory). Cần có bộ điều hợp (Model Adapter) phân tầng thích ứng môi trường.

---

### 2.2. Phân hệ Tìm kiếm bằng hình ảnh (Visual Search)
* **Hiện trạng trong kho mã nguồn**:
  - Giao diện `frontend/fashion-ai-web/src/app/features/visual-search/pages/visual-search-page.component.ts` đã có giao diện người dùng tải ảnh và chọn ảnh mẫu.
  - Microservice `ai-service/app/api/routes/visual_search.py` khai báo endpoint `POST /internal/v1/search/visual`.
* **Khoảng trống kỹ thuật thực tế (Gaps)**:
  - **Mô phỏng giả lập 100%**: Trong giao diện Angular, hàm `runSearch()` sử dụng `setTimeout(..., 1200)` để gán cứng 4 sản phẩm mẫu từ mảng cục bộ kèm điểm tương đồng giả lập (0.968, 0.892, 0.845, 0.781). Endpoint tại backend trả về mảng rỗng `matches: []`.
  - **Chưa có bộ trích xuất đặc trưng (Feature Extractor)**: Chưa có module trích xuất vector embedding thực sự từ ảnh tải lên.
  - **Chưa có chỉ mục vector danh mục sản phẩm (Precomputed Embeddings Index)**: 42 sản phẩm Uniqlo thực tế trong catalog chưa được tính toán và lập chỉ mục embedding trước, khiến việc tìm kiếm không thể thực hiện trên dữ liệu sống.
  - **Chưa có cơ chế xếp hạng kết hợp (Hybrid Ranking)**: Chưa kết hợp được độ tương đồng thị giác (Cosine Similarity) với thuộc tính phân loại (Category) và mức giá (Price Compatibility).

---

### 2.3. Phân hệ Tư vấn kích cỡ (Size Recommendation)
* **Hiện trạng trong kho mã nguồn**:
  - Trang chi tiết sản phẩm (`product-detail-page.component.html`) có nút "Hướng dẫn chọn size" mở một Modal chứa bảng HTML tĩnh 4 dòng (S, M, L, XL) theo khoảng chiều cao và cân nặng chung.
* **Khoảng trống kỹ thuật thực tế (Gaps)**:
  - **Không có thuật toán so khớp**: Không hề có mã nguồn tính toán số đo.
  - **Nhầm lẫn giữa số đo cơ thể và thông số may mặc**: Một chiếc áo khoác phom rộng và một chiếc áo thun ôm sát có số đo thành phẩm hoàn toàn khác nhau dù dành cho người có cùng số đo ngực. Bảng tĩnh hiện tại bỏ qua độ cử động (Ease Allowance) và sở thích mặc (Slim fit, Regular fit, Relaxed fit).
  - **Không giải thích được (Black-box / Tĩnh)**: Không giải thích cho người dùng tại sao lại khuyên chọn size đó (ví dụ: ngực vừa vặn nhưng vai hơi chật, hay chiều dài phủ hông).

---

### 2.4. Phân hệ Cơ sở dữ liệu & Quản lý sản phẩm
* **Hiện trạng trong kho mã nguồn**:
  - File `20261016000100_ecommerce_vton.sql` đã thiết kế đầy đủ các bảng E-commerce: `profiles`, `categories`, `products`, `product_variants`, `orders`, `order_items`, `payments`, `reviews`, `try_on_jobs`.
  - Đã có dữ liệu hạt giống (seed) 42 sản phẩm thật cào từ Uniqlo với link ảnh CDN chính xác (`thumbnailUrl`, `garmentImageUrl`, màu sắc, kích thước, số lượng tồn kho).
* **Khoảng trống kỹ thuật thực tế (Gaps)**:
  - Bảng `try_on_jobs` chưa lưu trữ chi tiết profiling thời gian thực thi của từng công đoạn và nhật ký kiểm định đầu vào.
  - Chưa có bảng `size_charts` lưu thông số kích thước thành phẩm thực tế theo từng danh mục/sản phẩm.
  - Chưa có bảng `user_body_measurements` lưu thông số cơ thể người dùng phục vụ tính toán tự động.
  - Chưa có bảng `product_image_embeddings` hỗ trợ lưu vector đặc trưng phục vụ tìm kiếm.

---

## 3. CƠ HỘI ĐÓNG GÓP KỸ THUẬT & NGHIÊN CỨU THỰC CHẤT

Thay vì chỉ cấu hình hay gọi một mô hình có sẵn rồi tuyên bố là đóng góp AI mới, đề tài tập trung vào việc **thiết kế và hiện thực hóa các đóng góp kỹ thuật có thể đo lường và kiểm chứng thực nghiệm**:

1. **Đóng góp A — Nâng cấp Đường ống Thử đồ ảo Tin cậy (VTON Pipeline Orchestration & Quality Assurance)**:
   - Xây dựng bộ lọc kiểm định chất lượng ảnh đầu vào đa tiêu chí (độ mờ Laplacian, dải sáng, tỷ lệ khung hình, phát hiện người).
   - Thiết kế mô hình điều phối tác vụ phi đồng bộ có mã định danh `task_id`, theo dõi trạng thái luồng và phân tích chi tiết độ trễ từng công đoạn.
   - Xây dựng kiến trúc Model Adapter thích ứng linh hoạt giữa môi trường GPU chuyên dụng và CPU fallback.

2. **Đóng góp B — Hệ thống Tìm kiếm Sản phẩm bằng Hình ảnh qua Vector Embedding**:
   - Hiện thực hóa bộ trích xuất đặc trưng thị giác sử dụng backbone học sâu kết hợp chuẩn hóa $L_2$.
   - Tính toán và lập chỉ mục trước (Precomputed Index) cho toàn bộ 42 sản phẩm thực tế trong catalog.
   - Hiện thực hóa thuật toán xếp hạng lai (Hybrid Ranking) kết hợp độ tương đồng vector cosine với tương thích thuộc tính danh mục.
   - Đấu nối toàn diện từ API FastAPI đến giao diện Angular.

3. **Đóng góp C — Thuật toán Gợi ý Kích cỡ Giải thích được (Explainable Size Scoring)**:
   - Thiết lập mô hình dữ liệu phân định rõ ràng giữa Số đo cơ thể (Body Measurements) và Số đo thành phẩm (Garment Measurements).
   - Thiết kế hàm phạt bất đối xứng (Asymmetric Penalty Function) có cấu hình độ cử động theo danh mục (T-shirts, Outerwear, Pants) và sở thích người mặc (Slim, Regular, Relaxed).
   - Trả về khuyến nghị Top-1, Top-2 kèm diễn giải minh bạch từng số đo thành phần trên giao diện Product Detail Page.

4. **Đóng góp D — Khung Thực nghiệm & Đánh giá Khoa học Tái lập được**:
   - Xây dựng bộ dữ liệu kiểm chuẩn có nhãn cho Visual Search, Size Recommendation và VTON Input Validation.
   - Viết kịch bản tự động đo đạc các chỉ số học máy chuẩn: Precision@K, Recall@K, mAP@K, Top-1/Top-2 Accuracy, p50/p95 Latency.

---

## 4. MA TRẬN MÃ NGUỒN CẦN PHÁT TRIỂN & ĐIỀU CHỈNH

| Phân hệ / Thành phần | Tệp mã nguồn | Trạng thái | Nhiệm vụ kỹ thuật cần thực hiện |
| :--- | :--- | :--- | :--- |
| **Visual Search Extractor** | `ai-service/app/visual_search/extractor.py` | Tạo mới | Trích xuất vector đặc trưng hình ảnh chuẩn hóa $L_2$ |
| **Catalog Indexer** | `ai-service/app/visual_search/catalog_indexer.py` | Tạo mới | Lập chỉ mục 42 sản phẩm, tìm kiếm Cosine & Hybrid |
| **Visual Search API** | `ai-service/app/api/routes/visual_search.py` | Nâng cấp | Thay thế mock bằng trích xuất và truy vấn vector thật |
| **Visual Search UI** | `frontend/.../visual-search-page.component.ts` | Nâng cấp | Đấu nối gọi API tìm kiếm thật, hiển thị độ tương đồng thực |
| **Size Recommender Engine** | `ai-service/app/sizing/recommender.py` | Tạo mới | Thuật toán chấm điểm kích cỡ giải thích được |
| **Size API Router** | `ai-service/app/api/routes/sizing.py` | Tạo mới | Endpoint tiếp nhận số đo cơ thể và trả về gợi ý |
| **Size Recommendation Service** | `frontend/.../size-recommendation.service.ts` | Tạo mới | Service tính toán và tích hợp giao diện người dùng |
| **Size Guide UI Modal** | `frontend/.../product-detail-page.component.ts,html` | Nâng cấp | Form nhập số đo tương tác, hiển thị phân tích AI |
| **VTON Input Validator** | `ai-service/app/tryon/validator.py` | Tạo mới | Kiểm tra định dạng, độ mờ, độ sáng, tỷ lệ và dáng người |
| **VTON Orchestrator & Adapter**| `ai-service/app/tryon/orchestrator.py, adapter.py` | Tạo mới | Quản lý vòng đời tác vụ, đo đạc độ trễ, thích ứng GPU/CPU |
| **VTON API Router** | `ai-service/app/api/routes/tryon.py` | Nâng cấp | Tiếp nhận tác vụ, điều phối qua pipeline kiểm định |
| **VTON UI Page** | `frontend/.../try-on-page.component.ts` | Nâng cấp | Kết nối API điều phối thật, thông báo lỗi kiểm định |
| **Database Migration** | `docs/supabase_vton_schema/20261016000300_ai_contributions.sql` | Tạo mới | Bổ sung bảng size_charts, body_measurements, embeddings |
| **Evaluation Framework** | `scripts/evaluate_ai.py` | Tạo mới | Kịch bản đo lường Precision, Recall, mAP, Latency tự động |
| **Research Documentation** | `docs/research/*.md` | Tạo mới | Soạn thảo 5 tài liệu nghiên cứu chuẩn báo cáo học thuật |

---

## 5. ĐÁNH GIÁ YÊU CẦU TÀI NGUYÊN VÀ RỦI RO KỸ THUẬT

1. **Bộ nhớ và GPU**:
   - IDM-VTON nguyên bản yêu cầu nạp mô hình Stable Diffusion XL (> 10GB trọng số). Trên hệ thống không có card Nvidia 16GB+ VRAM, việc gọi trực tiếp mô hình sẽ gây sập tiến trình. Do đó kiến trúc Model Adapter với cơ chế phân tầng (Tiered Execution) là bắt buộc.
2. **Độ trễ Visual Search**:
   - Trích xuất vector trên CPU cần đảm bảo $\le 100\text{ms}$ cho mỗi ảnh truy vấn. Lựa chọn backbone MobileNetV3 / ResNet tinh gọn kết hợp cache mảng Numpy đảm bảo thời gian phản hồi đạt tiêu chuẩn ứng dụng thương mại.
3. **Tính toàn vẹn dữ liệu**:
   - Mọi cải tiến phải tương thích ngược với 42 sản phẩm Uniqlo và lược đồ PostgreSQL hiện tại, không làm gián đoạn luồng mua sắm, giỏ hàng, tài khoản và xác thực.
