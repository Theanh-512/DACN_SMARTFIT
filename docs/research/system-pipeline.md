# KIẾN TRÚC ĐƯỜNG ỐNG HỆ THỐNG & TÍCH HỢP TOÀN DIỆN (SYSTEM PIPELINE)
## Dự án: Nền tảng Thương mại Điện tử Thời trang Tích hợp AI (SmartFit Fashion AI)
**Phiên bản**: 2.0  
**Ngày cập nhật**: 16/10/2026  

---

## 1. KIẾN TRÚC TỔNG THỂ HỆ THỐNG (SYSTEM ARCHITECTURE)

Hệ thống SmartFit được thiết kế theo mô hình Microservices phân tán, kết hợp giữa nền tảng Web SPA hiện đại, dịch vụ suy luận AI chuyên biệt và hệ quản trị cơ sở dữ liệu quan hệ PostgreSQL (Supabase):

```mermaid
graph TB
    subgraph "Client Layer (Web SPA)"
        User[Người dùng]
        AngularApp["Angular 20 SPA\n(fashion-ai-web)"]
        User --> AngularApp
    end

    subgraph "API & Service Layer"
        FastAPI["AI Microservice (FastAPI)\n:8000"]
        DotNet["Backend Web API (.NET)\n:5000"]
    end

    subgraph "AI Engines (ai-service/app/)"
        VTON["Virtual Try-On Pipeline\n(Validator, Orchestrator, Adapter)"]
        Search["Visual Search Engine\n(FeatureExtractor, CatalogIndexer)"]
        Sizing["Size Recommender\n(ExplainableFitScorer)"]
    end

    subgraph "Data & Storage Layer"
        DB[("Supabase PostgreSQL\n(Profiles, Orders, Products)")]
        VectorIdx["Precomputed Embeddings\n(catalog_embeddings.npz)"]
        StaticStorage["Local/S3 File Storage\n(/results/*.jpg)"]
    end

    AngularApp -- "REST HTTP / Form-Data" --> FastAPI
    AngularApp -- "GraphQL / Supabase Client" --> DB

    FastAPI --> VTON
    FastAPI --> Search
    FastAPI --> Sizing

    Search --> VectorIdx
    VTON --> StaticStorage
    FastAPI --> DB
```

---

## 2. ĐƯỜNG ỐNG THỬ ĐỒ ẢO CHI TIẾT (VIRTUAL TRY-ON PIPELINE)

Quy trình thử đồ ảo được thiết kế theo mô hình kiểm định trước - suy luận sau (Fail-Fast Architecture), đảm bảo không lãng phí tài nguyên tính toán đối với ảnh không đạt chuẩn:

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng
    participant UI as Try-On Page (Angular)
    participant API as FastAPI Router (/tryon)
    participant Val as TryOnInputValidator
    participant Orch as TryOnOrchestrator
    participant Model as TryOnModelAdapter
    participant Store as Storage System

    User->>UI: Tải ảnh chân dung & chọn sản phẩm
    UI->>API: POST /internal/v1/tryon/upload-and-run
    API->>Orch: Khởi tạo tác vụ (task_id, Status: QUEUED)
    
    rect rgb(240, 248, 255)
    Note over Orch,Val: Giai đoạn 1: Kiểm định chất lượng đầu vào
    Orch->>Val: validate_person_image(image_bytes)
    alt Ảnh mờ / thiếu sáng / sai tỷ lệ / không có người
        Val-->>Orch: ValidationResult(is_valid: False, error_code)
        Orch-->>API: Trạng thái FAILED + Chẩn đoán chi tiết
        API-->>UI: 400 Bad Request / Lỗi kiểm định
        UI-->>User: Hiển thị cảnh báo & hướng dẫn chụp lại
    else Ảnh đạt chuẩn chất lượng
        Val-->>Orch: ValidationResult(is_valid: True)
    end
    end

    rect rgb(255, 250, 240)
    Note over Orch,Model: Giai đoạn 2: Tiền xử lý & Suy luận thích ứng
    Orch->>Model: execute_inference(task_id, person, garment)
    Model->>Model: Tách nền trang phục packshot Uniqlo
    Model->>Model: Nắn chỉnh hình học Affine & Cân bằng dải sáng
    Model->>Model: Hòa trộn nếp vải & chi tiết may mặc
    end

    rect rgb(240, 255, 240)
    Note over Orch,Store: Giai đoạn 3: Hậu xử lý & Phân phối kết quả
    Model->>Store: Lưu ảnh thành phẩm (/data/results/{task_id}.jpg)
    Model-->>Orch: Kết quả suy luận + Bản ghi độ trễ từng chặng
    Orch-->>API: JobProgress(Status: SUCCEEDED, timings)
    API-->>UI: Trả về output_image_url + timings (ms)
    UI-->>User: Hiển thị ảnh thử đồ 3D + Nút thêm vào giỏ hàng
    end
```

---

## 3. ĐƯỜNG ỐNG TÌM KIẾM BẰNG HÌNH ẢNH (VISUAL SEARCH PIPELINE)

Hệ thống tìm kiếm thị giác vận hành theo nguyên lý so khớp vector embedding trong không gian đa chiều:

```mermaid
flowchart TD
    A[Người dùng tải ảnh lên / Chọn ảnh mẫu] --> B[Tiền xử lý ảnh: Resize 224x224, Chuẩn hóa ImageNet]
    B --> C[MobileNetV3 Feature Extractor]
    C --> D["Trích xuất vector 576 chiều (L2 Normalized)"]
    
    subgraph "Kho chỉ mục nạp sẵn trong RAM"
        E[catalog_embeddings.npz: 42 sản phẩm x 576 chiều]
        F[catalog_metadata.json: Tên, Giá, Danh mục, Link ảnh]
    end

    D --> G["Tính tích vô hướng Dot Product (Cosine Similarity)"]
    E --> G
    G --> H["Chuyển đổi sang thang điểm [0, 1]"]
    H --> I{"Áp dụng bộ lọc danh mục & khoảng giá"}
    I --> J["Tính điểm Hybrid: Score = 0.9 * Visual + 0.1 * Attribute"]
    J --> K[Sắp xếp giảm dần và lấy Top-K = 8 kết quả]
    F --> K
    K --> L[Trả về phản hồi kèm điểm tương đồng & độ trễ tính toán]
```

---

## 4. ĐƯỜNG ỐNG TƯ VẤN KÍCH CỠ GIẢI THÍCH ĐƯỢC (SIZE RECOMMENDER PIPELINE)

```mermaid
flowchart LR
    subgraph "Dữ liệu đầu vào"
        U1[Chiều cao cm, Cân nặng kg]
        U2[Vòng ngực, Vòng eo cm]
        U3[Sở thích mặc: Slim / Regular / Relaxed]
        P1[Danh mục: Áo thun / Áo khoác / Quần]
    end

    subgraph "Xử lý & Ước lượng"
        U1 --> E1[Ước lượng hồi quy các vòng còn thiếu]
        U2 --> E2[Hợp nhất bộ thông số cơ thể hoàn chỉnh]
        E1 --> E2
        P1 --> E3[Xác định thông số may đo thành phẩm chuẩn LifeWear]
        P1 & U3 --> E4[Tra cứu độ cử động mục tiêu Target Ease]
    end

    subgraph "Mô hình chấm điểm bất đối xứng"
        E2 & E3 --> S1["Tính độ cử động thực tế: ActualEase = Garment - Body"]
        S1 & E4 --> S2["Hàm phạt bất đối xứng (Asymmetric Penalty)"]
        S2 --> S3["Xếp hạng kích cỡ: Chọn Top-1 & Top-2"]
    end

    subgraph "Tạo nội dung giải thích"
        S3 --> R1[Tỷ lệ tương thích %]
        S3 --> R2[Bảng so sánh chi tiết các số đo vòng]
        S3 --> R3[Diễn giải văn bản lý do chọn size]
        R1 & R2 & R3 --> Out[Hiển thị trực quan trên Modal PDP]
    end
```

---

## 5. ĐƯỜNG ỐNG SÂN KHẤU 3D NHÂN TRẮC HỌC & ĐÁNH GIÁ ĐỘ VỪA VẶN MESH (3D FITTING PIPELINE)

Quy trình tạo nhân vật 3D tương tác và đánh giá độ vừa vặn vật lý chuẩn ISO 8559:

```mermaid
sequenceDiagram
    autonumber
    actor User as Khách hàng
    participant UI as 3D Fitting Studio (Angular)
    participant API as FastAPI Router (/avatar)
    participant Extractor as FocusedAnthropometry
    participant Gen as SmplxMeshGenerator
    participant MV as Google <model-viewer>

    Note over User,UI: Bước 1 & 2: Tạo nhân vật & Chỉnh sửa vóc dáng thời gian thực
    User->>UI: Tải ảnh cá nhân hoặc kéo thanh trượt (H: 175cm, W: 72kg, Body: Athletic, Skin)
    UI->>API: POST /internal/v1/avatar/reconstruct
    API->>Extractor: estimate_betas_from_metrics(H, W, BodyType) -> beta in R^10
    API->>Extractor: calculate_iso8559_from_betas(beta) -> Chest, Waist, Hip, Shoulder
    API->>Gen: create_body_mesh(beta, H, skin_color)
    Gen->>Gen: export_scene_glb(body_mesh) -> /results/avatars/base_avatar.glb (57 KB)
    API-->>UI: glb_url + beta vector + iso_measurements
    UI->>MV: Nạp file 3D GLB & Render nhân vật mộc ở dáng A-pose
    MV-->>User: Xoay 360°, đổi màu da tức thì theo thời gian thực

    Note over User,UI: Bước 3 & 4: Mặc đồ 3D & Quét va chạm Tension Heatmap
    User->>UI: Chọn áo (T-shirt), chọn Size S, chọn màu Navy & Nhấn "Mặc áo lên 3D"
    UI->>API: POST /internal/v1/avatar/tryon-3d (beta, Size S, ProductId, Heatmap: True)
    API->>Gen: create_garment_mesh(Category, Size S, beta)
    API->>Gen: evaluate_fit_and_apply_heatmap(body_mesh, garment_mesh)
    Gen->>Gen: Kiểm tra khoảng cách vector pháp tuyến delta(v) = (v_g - v_b) . n_b
    alt Đỉnh đâm xuyên delta < 0 (Chật ngực/vai)
        Gen->>Gen: Tô màu ĐỎ rực rỡ (Tension Stress) lên các đỉnh ngực và vai
        Gen->>Gen: Tính tỷ lệ Overpressure (vd: 34.5%)
        Gen->>Gen: Đề xuất hành động size_up sang Size L
    else Đạt chuẩn độ cử động
        Gen->>Gen: Giữ màu vải tự nhiên / Xanh dịu
    end
    Gen->>Gen: export_scene_glb(body + garment_with_heatmap) -> tryon_S.glb
    API-->>UI: scene_glb_url + fit_diagnostic (Cảnh báo chật ngực + Vai, Đề xuất Size L)
    UI->>MV: Cập nhật mô hình 3D mặc áo với các vùng căng chật màu đỏ
    UI-->>User: Hiển thị cảnh báo trực quan & Nút "Đổi sang Size L ngay"
```

---

## 6. CƠ CHẾ ĐẢM BẢO AN TOÀN & BẢO VỆ DỮ LIỆU RIÊNG TƯ (SECURITY & PRIVACY)

1. **Bảo mật ảnh cá nhân người dùng**:
   - Ảnh chân dung người dùng tải lên phục vụ thử đồ ảo được xử lý trong bộ nhớ tạm thời hoặc lưu trữ tại vùng bộ nhớ đệm riêng biệt, không công khai cho người dùng khác xem.
2. **Xác thực và ủy quyền đa tầng**:
   - Mọi thao tác mua sắm, quản lý đơn hàng và số đo cơ thể cá nhân được bảo vệ qua Supabase Row Level Security (RLS). Người dùng chỉ có quyền đọc và cập nhật bản ghi có `user_id = auth.uid()`.
3. **Chống giả mạo giá tiền và kho hàng**:
   - Client không bao giờ được phép gửi giá tiền tùy ý lên server. Mọi giá sản phẩm được tính toán độc lập tại tầng cơ sở dữ liệu dựa trên bảng `products` và `product_variants`.
