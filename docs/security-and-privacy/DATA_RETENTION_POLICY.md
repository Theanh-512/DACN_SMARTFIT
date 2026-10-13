# Data Retention & User Privacy Policy

Chính sách bảo mật dữ liệu sinh trắc học và quản lý vòng đời hình ảnh người dùng tuân thủ Nghị định 13/2023/NĐ-CP và tiêu chuẩn GDPR.

---

## 1. Nguyên Tắc Bảo Mật Dữ Liệu
1. **Lưu trữ cách ly (Isolated Storage)**: Ảnh người dùng tải lên được lưu trong private bucket S3 riêng biệt, không cấp quyền đọc public cho Internet.
2. **Truy cập tạm thời (Short-lived Presigned URLs)**: Mọi thao tác hiển thị ảnh trên trình duyệt chỉ thông qua presigned URL có hạn sử dụng tối đa **15 phút**.
3. **Mã hóa khi lưu trữ (Encryption at Rest)**: Toàn bộ tệp ảnh được mã hóa bằng AES-256 (Server-Side Encryption SSE-S3).

---

## 2. Vòng Đời Tự Hủy Hình Ảnh (TTL Purge)
- **Ảnh người dùng gốc (Person Images)**: Tự động xóa vĩnh viễn sau **24 giờ** kể từ khi tác vụ thử đồ kết thúc.
- **Ảnh kết quả thử đồ (Generated Try-on Results)**: Lưu trữ tạm thời tối đa **7 ngày** phục vụ xem lại, trừ trường hợp hội viên chủ động nhấn *"Lưu vào Tủ đồ cá nhân"*.
- **Quyền được lãng quên**: Cung cấp tùy chọn trong trang tài khoản cho phép người dùng xóa ngay lập tức mọi lịch sử thử đồ và dữ liệu hình ảnh liên quan.
