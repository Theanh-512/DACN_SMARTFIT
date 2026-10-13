# CMS Field Guidelines (Strapi & Payload)

Tài liệu quy định cấu trúc và quy chuẩn đặt tên trường dữ liệu (field naming) khi định nghĩa Content Types trong Strapi và Collections trong Payload CMS, đảm bảo tính tương thích với Angular Frontend.

---

## 1. Chuẩn đặt tên tổng quát (General Naming Convention)
- **Tên trường (Field Keys)**: Sử dụng `camelCase` (ví dụ: `publishedDate`, `heroTitle`, `coverImage`).
- **Khóa định danh (Identifiers)**: `id` (String hoặc Number), `slug` (String, unique, index).
- **Trường thời gian**: `createdAt`, `updatedAt`, `publishedAt` định dạng ISO-8601 string.

---

## 2. Quy chuẩn các nhóm trường phổ biến

### 2.1. Basic Text & Content
| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `title` | String | Tiêu đề chính của bài viết/dịch vụ/trang |
| `slug` | String (UID) | Đường dẫn định danh URL |
| `summary` / `excerpt` | Text | Tóm tắt ngắn (1-2 câu) cho SEO và Card preview |
| `content` | RichText / Blocks | Nội dung chi tiết (Markdown hoặc Slate/Lexical JSON) |

### 2.2. Media & Images
| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `coverImage` | Media (Single) | Ảnh đại diện chính |
| `gallery` | Media (Multiple) | Danh sách ảnh bổ trợ |
| `altText` | String | Văn bản thay thế cho SEO/Accessibility |

*Lưu ý: Luôn trả về CDN URL hoặc đường dẫn tương đối đã qua CDN Edge.*

### 2.3. SEO Metadata Fields
| Tên trường | Kiểu dữ liệu | Mô tả |
| :--- | :--- | :--- |
| `seoTitle` | String | Meta title hiển thị trên tab trình duyệt |
| `seoDescription`| String | Meta description cho công cụ tìm kiếm |
| `canonicalUrl` | String | Đường dẫn chuẩn tránh trùng lặp nội dung |
| `ogImage` | Media (Single) | Ảnh hiển thị khi chia sẻ Facebook/Zalo/LinkedIn |

---

## 3. Quy tắc quan hệ (Relations)
- Quan hệ N-1 hoặc N-N nên được populate có kiểm soát (`depth=1` hoặc `depth=2`) để tránh tải thừa dữ liệu.
- Trong môi trường Staging/Production, trường `status` phải là `published` mới được trả về qua public API.
