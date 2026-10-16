# QUY THỨC THỬ NGHIỆM & ĐẶC TẢ TẬP DỮ LIỆU KIỂM CHUẨN (EXPERIMENT PROTOCOL)
## Dự án: Nền tảng Thương mại Điện tử Thời trang Tích hợp AI (SmartFit Fashion AI)
**Ngày ban hành**: 16/10/2026  
**Tiêu chuẩn thực nghiệm**: Định lượng, Tái lập được, Không ngụy tạo số liệu  

---

## 1. MỤC TIÊU VÀ NGUYÊN TẮC THỰC NGHIỆM

Mục tiêu của quy thức thực nghiệm là cung cấp một phương pháp luận đánh giá khoa học, khách quan và minh bạch nhằm đo lường hiệu năng của các thuật toán và đường ống AI đã triển khai trong hệ thống SmartFit.

Nguyên tắc bắt buộc:
1. **Không ngụy tạo số liệu**: Toàn bộ kết quả phải được xuất ra từ việc chạy kịch bản thực nghiệm tự động `scripts/evaluate_ai.py` trên dữ liệu thật.
2. **Khả năng tái lập (Reproducibility)**: Bất kỳ thành viên hội đồng hoặc kỹ sư nào cũng có thể chạy lại lệnh `python scripts/evaluate_ai.py` và thu được kết quả tương đương.
3. **Phân tách rõ ràng giữa giả thuyết và bằng chứng**: Phân định cụ thể giữa những gì đã đo đạc thực nghiệm và những gì là hướng phát triển tương lai.

---

## 2. MÔI TRƯỜNG PHẦN CỨNG VÀ PHẦN MỀM THỰC NGHIỆM

* **Môi trường phần cứng**:
  - Vi xử lý (CPU): Intel Core Processor (x86_64, Windows OS).
  - Bộ nhớ RAM: 16 GB DDR4/DDR5.
  - Môi trường đánh giá suy luận: CPU Execution Mode (đo lường cận dưới của hiệu năng, đảm bảo hệ thống vận hành tốt ngay cả trên máy chủ không có GPU).
* **Môi trường phần mềm & Thư viện**:
  - Python: 3.14.x AMD64.
  - PyTorch: 2.11.0+cpu.
  - Torchvision: 0.26.0+cpu.
  - OpenCV: 4.13.0 (opencv-python-headless).
  - FastAPI: 0.99.1, Uvicorn: 0.46.0.
  - Frontend: Node.js 20+, Angular 20.

---

## 3. THIẾT KẾ TẬP DỮ LIỆU KIỂM CHUẨN (BENCHMARK DATASETS)

### 3.1. Tập dữ liệu chỉ mục sản phẩm (Catalog Index Dataset)
- **Quy mô**: 42 sản phẩm thời trang LifeWear thực tế cào từ Uniqlo Việt Nam.
- **Trường dữ liệu**: `id`, `name`, `slug`, `categoryId`, `categoryName`, `basePrice`, `thumbnailUrl`, `variants`.
- **Phân bố danh mục**:
  - Áo khoác & Cardigan (`cat-jackets`): 12 sản phẩm.
  - Áo lông cừu (`cat-fleece`): 4 sản phẩm.
  - Áo thun & Polo (`cat-tshirts`): 10 sản phẩm.
  - Áo sơ mi (`cat-shirts`): 4 sản phẩm.
  - Quần dài (`cat-pants`): 6 sản phẩm.
  - Quần jeans (`cat-jeans`): 4 sản phẩm.
  - Đầm & Váy (`cat-dresses`): 2 sản phẩm.

### 3.2. Tập dữ liệu kiểm chuẩn Visual Search
- **Tập truy vấn (Test Queries)**: 5 nhóm ảnh đại diện từ các danh mục sản phẩm chính.
- **Mô phỏng góc chụp thực tế**: Mỗi ảnh truy vấn được thực hiện 5 lượt kiểm thử kết hợp nhiễu ngẫu nhiên Gaussian $\mathcal{N}(0, 0.04)$ mô phỏng góc chụp chéo, ánh sáng môi trường thay đổi, tổng cộng **25 lượt truy vấn thực nghiệm**.
- **Nhãn đúng (Ground Truth)**: Sản phẩm được coi là đúng (Relevant) khi trùng khớp danh mục (`category_id`) và kiểu dáng với ảnh truy vấn.

### 3.3. Tập dữ liệu kiểm chuẩn Size Recommendation
- **Quy mô**: 20 hồ sơ nhân trắc học tiêu chuẩn đại diện cho các nhóm vóc dáng người Việt (Gầy/nhỏ nhắn, Cân đối/trung bình, Thể thao/vạm vỡ, Đậm người/ngoại cỡ).
- **Trường dữ liệu**: Chiều cao (cm), Cân nặng (kg), Vòng ngực (cm), Vòng eo (cm), Danh mục trang phục, Sở thích phom dáng (`slim`, `regular`, `relaxed`).
- **Nhãn kích cỡ chuẩn (Ground Truth Size Label)**: Được xác định bởi chuyên gia may mặc dựa trên thông số may đo thành phẩm thực tế của Uniqlo và độ cử động chuẩn LifeWear.

### 3.4. Tập dữ liệu kiểm chuẩn VTON Input Quality Filter
- **Tập mẫu kiểm tra**:
  1. *Ảnh chân dung hợp lệ (Positive)*: Có diện mạo người, độ tương phản sắc nét ($\sigma_L^2 > 80$), tỷ lệ đứng 3:4.
  2. *Ảnh mờ out nét (Negative - Blurry)*: Ảnh bị rung lắc, làm mờ bằng Gaussian kernel $65 \times 65$.
  3. *Ảnh thiếu sáng (Negative - Underexposed)*: Ảnh có độ sáng trung bình $\mu_Y = 15 < 35$.
  4. *Ảnh sai tỷ lệ (Negative - Landscape)*: Ảnh phong cảnh tỷ lệ $16:9$ ($w/h = 1.77 > 1.4$).

---

## 4. CÔNG THỨC TOÁN HỌC CÁC CHỈ SỐ ĐO LƯỜNG (METRIC FORMULATIONS)

### 4.1. Visual Search Metrics
1. **Precision tại K (P@K)**:
   $$P@K = \frac{\sum_{i=1}^K \text{rel}(i)}{K}$$
   với $\text{rel}(i) = 1$ nếu sản phẩm thứ $i$ cùng danh mục/kiểu dáng, ngược lại bằng $0$.
2. **Mean Average Precision tại K (mAP@K)**:
   $$\text{AP@K} = \frac{1}{\min(R, K)} \sum_{k=1}^K P@k \cdot \text{rel}(k)$$
   $$\text{mAP@K} = \frac{1}{|Q|} \sum_{q \in Q} \text{AP@K}(q)$$
3. **Độ trễ truy vấn (Retrieval Latency)**:
   Đo bằng đồng hồ mili-giây độ chính xác cao (`time.perf_counter()`), báo cáo các phân vị $p_{50}$ (median) và $p_{95}$.

### 4.2. Size Recommendation Metrics
1. **Top-1 Accuracy**:
   $$\text{Acc}_{\text{Top-1}} = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(\hat{y}_i^{(1)} = y_i) \times 100\%$$
2. **Top-2 Accuracy**:
   $$\text{Acc}_{\text{Top-2}} = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(y_i \in \{\hat{y}_i^{(1)}, \hat{y}_i^{(2)}\}) \times 100\%$$
3. **Tỷ lệ bao phủ (Coverage Rate)**:
   Tỷ lệ các trường hợp hệ thống đưa ra được khuyến nghị hợp lệ và tự tin.

### 4.3. Pipeline Validation Metrics
1. **Filter Accuracy**:
   $$\text{Accuracy}_{\text{filter}} = \frac{\text{TP} + \text{TN}}{\text{TP} + \text{TN} + \text{FP} + \text{FN}} \times 100\%$$
2. **Validation Latency**:
   Thời gian thực thi hàm `validate_person_image` (yêu cầu $\le 30\text{ms}$).
