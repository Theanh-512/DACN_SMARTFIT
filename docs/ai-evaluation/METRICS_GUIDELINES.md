# AI Evaluation Metrics Guidelines

Tiêu chuẩn đánh giá khoa học và kỹ thuật cho các mô hình AI tích hợp trong hệ thống.

---

## 1. Virtual Try-On (IDM-VTON)
- **SSIM (Structural Similarity Index)**: Đánh giá độ tương đồng cấu trúc vùng cơ thể và chi tiết nếp gấp vải (> 0.85 trên tập test VITON-HD).
- **LPIPS (Learned Perceptual Image Patch Similarity)**: Đánh giá chất lượng thị giác cảm nhận người dùng (càng thấp càng tốt, < 0.12).
- **FID (Fréchet Inception Distance)**: Đo lường độ chân thực của ảnh sinh ra so với ảnh thực tế.
- **Inference Latency**: Thời gian suy luận hoàn thành một lượt thử đồ (< 10 giây trên GPU RTX 4090 / A100).

---

## 2. Visual Search (SigLIP + FAISS)
- **mAP@K (Mean Average Precision tại K=5, K=10)**: Tỷ lệ sản phẩm tương đồng về kiểu dáng và hoa văn nằm trong top kết quả trả về (> 75%).
- **Recall@K**: Tỷ lệ tìm thấy đúng sản phẩm mục tiêu khi người dùng chụp ảnh thực tế.
- **Retrieval Latency**: Thời gian trích xuất vector embedding và truy vấn FAISS index (< 250ms).
