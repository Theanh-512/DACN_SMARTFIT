# Payload CMS Integration Notes

Tài liệu hướng dẫn kết nối và cấu hình tích hợp giữa Angular Frontend (`studio-web`) và Payload CMS trên Render Web Service.

---

## 1. Cấu hình Endpoint & Khác biệt với Strapi
- **Base URL**: `environment.cmsApiBaseUrl` (mặc định: `http://localhost:3000/api` hoặc qua reverse proxy).
- **Cấu trúc Dữ liệu Phẳng**: Không dùng vỏ bọc lồng `attributes`, dữ liệu của Payload trả về trực tiếp trong `docs`:
```json
{
  "docs": [
    {
      "id": "64f9b8...",
      "title": "SmartFit Premium Plan",
      "slug": "smartfit-premium-plan",
      "coverImage": {
        "url": "/media/image.webp",
        "alt": "SmartFit Cover"
      }
    }
  ],
  "totalDocs": 15,
  "limit": 10,
  "page": 1,
  "totalPages": 2
}
```

---

## 2. Truy vấn & Depth Parameter
- **Depth**: Tham số `depth=1` hoặc `depth=2` xác định mức độ populate tự động các quan hệ (Upload Media, Category, Author).
- **Filtering**:
  - `?where[slug][equals]=smartfit-premium-plan`
- **Draft & Preview Mode**:
  - Truyền query `?draft=true` kèm theo Preview Token khi kích hoạt chế độ xem trước nội dung chưa xuất bản.

---

## 3. Quản lý File Uploads & S3 CDN
Payload CMS tích hợp adapter `@payloadcms/plugin-cloud-storage` (S3/R2). Mọi URL trả về đều được chuẩn hóa qua `PayloadAdapter` để kết nối tới CDN prefix được cấu hình trong `environment.mediaCdnBaseUrl`.
