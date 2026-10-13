# Strapi Integration Notes

Tài liệu hướng dẫn kết nối và cấu hình tích hợp giữa Angular Frontend (`studio-web`) và Strapi CMS trên Render Web Service.

---

## 1. Cấu hình Endpoint & Authentication
- **Base URL**: Cấu hình qua `environment.cmsApiBaseUrl` (mặc định: `http://localhost:1337/api` ở local, `https://cms.example.com/api` ở prod).
- **Public Endpoints**: Các endpoint nội dung đọc công khai (ví dụ: `/api/articles`, `/api/services`, `/api/pricing-plans`) được cấp quyền `Public: find, findOne` trong Strapi Admin Roles & Permissions.
- **Protected Endpoints**: Yêu cầu Bearer Token qua header `Authorization: Bearer <API_TOKEN>` hoặc User JWT.

---

## 2. Truy vấn & Population (Populate & Filtering)
- **Cú pháp Populate**:
  - Lấy đầy đủ ảnh bìa và quan hệ cơ bản: `?populate=*`
  - Populate chọn lọc: `?populate[coverImage][fields][0]=url&populate[category][fields][0]=name`
- **Filtering theo Slug**:
  - `?filters[slug][$eq]=smartfit-workout`
- **Pagination**:
  - `?pagination[page]=1&pagination[pageSize]=10`

---

## 3. Định dạng dữ liệu trả về (Data Shape Normalization)
Strapi v4/v5 trả về dữ liệu đóng gói theo định dạng:
```json
{
  "data": [
    {
      "id": 1,
      "attributes": {
        "title": "SmartFit Pro Training",
        "slug": "smartfit-pro-training",
        "coverImage": {
          "data": {
            "attributes": {
              "url": "/uploads/image.webp"
            }
          }
        }
      }
    }
  ],
  "meta": {
    "pagination": { "page": 1, "pageSize": 10, "total": 25 }
  }
}
```
Lớp `StrapiAdapter` trong `src/app/core/cms/adapters/strapi.adapter.ts` có nhiệm vụ chuẩn hóa (flatten) dữ liệu này về dạng phẳng thuần TypeScript trước khi chuyển tới Component.
