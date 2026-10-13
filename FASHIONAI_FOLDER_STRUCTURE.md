# Đề xuất cấu trúc thư mục đồ án FashionAI

**Tên đề tài:** Nền tảng thương mại điện tử thời trang tích hợp AI Virtual Try-On và Visual Search  
**Kiến trúc:** Angular + ASP.NET Core Web API + Entity Framework Core + SQL Server + Python/FastAPI/PyTorch

## 1. Quy tắc tổ chức

1. Chia repository theo **ứng dụng/dịch vụ**: `frontend`, `backend`, `ai-service`, `infrastructure`, `docs`.
2. Trong từng ứng dụng, tổ chức theo **nghiệp vụ** thay vì gom tất cả service/model vào một thư mục tổng.
3. Backend .NET là nguồn dữ liệu nghiệp vụ chính cho tài khoản, sản phẩm, giá, tồn kho, đơn hàng và lịch sử AI.
4. AI service chỉ xử lý suy luận hình ảnh và tìm kiếm vector; không tự quản lý đơn hàng/tồn kho.
5. Không tích hợp Strapi và Payload cùng lúc nếu đề tài không thật sự cần hai CMS. Có thể quản lý nội dung cơ bản qua ASP.NET Core.
6. Không đưa secret, ảnh người dùng, dataset hoặc model checkpoint vào Git.

## 2. Cây thư mục toàn bộ repository

```text
FashionAI/
├── frontend/
│   └── fashion-ai-web/                       # Angular storefront + admin UI
│       ├── src/
│       │   ├── app/
│       │   │   ├── core/                     # Hạ tầng dùng toàn ứng dụng
│       │   │   │   ├── auth/                 # Auth state, auth service, guards
│       │   │   │   ├── http/                 # API client, interceptors
│       │   │   │   ├── config/               # API base URL/config tokens
│       │   │   │   └── services/             # Chỉ service thật sự dùng toàn app
│       │   │   ├── layout/                   # Khung giao diện theo khu vực
│       │   │   │   ├── storefront-layout/    # Header, footer, navigation khách hàng
│       │   │   │   ├── auth-layout/          # Khung login/register
│       │   │   │   └── admin-layout/         # Sidebar/topbar quản trị
│       │   │   ├── features/                 # Chức năng nghiệp vụ, theo domain
│       │   │   │   ├── home/
│       │   │   │   ├── auth/
│       │   │   │   │   ├── pages/            # login, register, forgot-password
│       │   │   │   │   ├── data-access/      # auth API client nếu tách khỏi core
│       │   │   │   │   ├── models/
│       │   │   │   │   └── auth.routes.ts
│       │   │   │   ├── catalog/
│       │   │   │   │   ├── pages/            # product-list, product-detail
│       │   │   │   │   ├── components/       # product-card, product-filter
│       │   │   │   │   ├── data-access/      # product-api.service.ts
│       │   │   │   │   ├── models/           # product, category, variant
│       │   │   │   │   └── catalog.routes.ts
│       │   │   │   ├── cart/
│       │   │   │   │   ├── pages/
│       │   │   │   │   ├── components/
│       │   │   │   │   ├── data-access/
│       │   │   │   │   └── cart.routes.ts
│       │   │   │   ├── checkout/             # Địa chỉ, xác nhận đơn, thanh toán
│       │   │   │   ├── orders/               # Lịch sử và chi tiết đơn hàng
│       │   │   │   ├── wishlist/             # Sản phẩm yêu thích
│       │   │   │   ├── reviews/              # Đánh giá sản phẩm
│       │   │   │   ├── account/              # Hồ sơ và thông tin cá nhân
│       │   │   │   ├── virtual-try-on/       # Chức năng thử đồ AI
│       │   │   │   │   ├── pages/            # try-on-create, try-on-result, try-on-history
│       │   │   │   │   ├── components/       # image-uploader, job-status, result-viewer
│       │   │   │   │   ├── data-access/      # try-on-api.service.ts
│       │   │   │   │   ├── models/           # job request/status/result
│       │   │   │   │   └── virtual-try-on.routes.ts
│       │   │   │   ├── visual-search/        # Tìm kiếm bằng ảnh
│       │   │   │   │   ├── pages/            # image-search, search-results
│       │   │   │   │   ├── components/       # image-query-uploader, result-grid
│       │   │   │   │   ├── data-access/      # visual-search-api.service.ts
│       │   │   │   │   ├── models/           # query, result, ranking
│       │   │   │   │   └── visual-search.routes.ts
│       │   │   │   ├── admin/                # Giao diện quản trị
│       │   │   │   │   ├── dashboard/
│       │   │   │   │   ├── products/
│       │   │   │   │   ├── categories/
│       │   │   │   │   ├── inventory/
│       │   │   │   │   ├── orders/
│       │   │   │   │   └── users/
│       │   │   │   └── content/             # about, faq, contact, blog nếu cần
│       │   │   ├── shared/                   # UI dùng lại, không chứa nghiệp vụ riêng
│       │   │   │   ├── ui/                   # button, modal, loading, empty-state
│       │   │   │   ├── directives/
│       │   │   │   └── pipes/
│       │   │   ├── testing/
│       │   │   │   └── mocks/               # Mock services/test fixtures
│       │   │   ├── app.config.ts
│       │   │   ├── app.config.server.ts      # Chỉ giữ nếu bật SSR
│       │   │   ├── app.routes.ts
│       │   │   ├── app.routes.server.ts      # Chỉ giữ nếu bật SSR
│       │   │   ├── app.ts
│       │   │   └── app.spec.ts
│       │   ├── environments/                 # Chỉ chứa cấu hình công khai phía client
│       │   ├── index.html
│       │   ├── main.ts
│       │   ├── main.server.ts                # Chỉ giữ nếu bật SSR
│       │   ├── server.ts                     # Chỉ giữ nếu cấu hình SSR cần file này
│       │   └── styles.scss
│       ├── e2e/                              # End-to-end frontend tests
│       ├── angular.json
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── backend/
│   └── FashionAI.Backend/
│       ├── FashionAI.sln
│       ├── src/
│       │   ├── FashionAI.Api/                # HTTP entry point, cấu hình, controllers/endpoints
│       │   │   ├── Controllers/
│       │   │   ├── Middleware/
│       │   │   ├── Authorization/
│       │   │   ├── Extensions/
│       │   │   └── Program.cs
│       │   ├── FashionAI.Application/        # Use cases, DTOs, validation, interfaces
│       │   │   ├── Auth/
│       │   │   ├── Catalog/
│       │   │   ├── Cart/
│       │   │   ├── Checkout/
│       │   │   ├── Orders/
│       │   │   ├── Wishlist/
│       │   │   ├── Reviews/
│       │   │   ├── VirtualTryOn/
│       │   │   ├── VisualSearch/
│       │   │   └── Common/
│       │   ├── FashionAI.Domain/             # Entities, enums, quy tắc nghiệp vụ cốt lõi
│       │   │   ├── Entities/
│       │   │   ├── Enums/
│       │   │   ├── ValueObjects/
│       │   │   └── Exceptions/
│       │   └── FashionAI.Infrastructure/     # EF Core và tích hợp dịch vụ ngoài
│       │       ├── Persistence/
│       │       │   ├── Configurations/
│       │       │   ├── Migrations/
│       │       │   └── FashionAIDbContext.cs
│       │       ├── Identity/
│       │       ├── Storage/
│       │       ├── AI/
│       │       └── Payments/
│       ├── tests/
│       │   ├── FashionAI.UnitTests/
│       │   └── FashionAI.IntegrationTests/
│       └── README.md
│
├── ai-service/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   └── routes/                      # try_on.py, visual_search.py, health.py
│   │   ├── core/                             # settings, logging, errors, auth nội bộ
│   │   ├── schemas/                          # Pydantic request/response DTOs
│   │   ├── storage/                          # Đọc/ghi ảnh thông qua storage abstraction
│   │   ├── try_on/                           # IDM-VTON integration
│   │   │   ├── preprocessing/
│   │   │   ├── inference/
│   │   │   └── postprocessing/
│   │   ├── visual_search/                    # SigLIP + FAISS
│   │   │   ├── embeddings/
│   │   │   ├── indexing/
│   │   │   └── retrieval/
│   │   └── workers/                          # Worker nền nếu xử lý theo job queue
│   ├── scripts/                              # Build/rebuild index, kiểm tra model
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── infrastructure/
│   ├── docker-compose.yml                    # Local development services
│   ├── reverse-proxy/                        # Chỉ dùng nếu cần
│   └── deployment/                           # Cấu hình deploy theo môi trường
│
├── docs/
│   ├── architecture/                         # Sơ đồ kiến trúc, luồng dữ liệu
│   ├── api-contracts/                         # API giữa Angular, backend và AI
│   ├── database/                             # ERD, data dictionary, migration notes
│   ├── ai-evaluation/                        # Dataset, metrics, kết quả thực nghiệm
│   ├── deployment/                           # Hướng dẫn chạy và triển khai
│   └── security-and-privacy/                 # Bảo mật, ảnh người dùng, lưu trữ/xóa dữ liệu
│
├── scripts/                                  # Script cấp repository
├── .gitignore
├── .env.example                              # Chỉ placeholder, không chứa secret thật
├── README.md                                 # Hướng dẫn chạy toàn dự án
└── ARCHITECTURE.md                           # Quyết định kiến trúc cấp hệ thống
```

## 3. Quy ước đặt tên

- Thư mục: `kebab-case`, ví dụ `virtual-try-on`, `visual-search`, `product-detail`.
- Angular component: dùng nhất quán `product-card.component.ts`, `.html`, `.scss`; không trộn nhiều kiểu đặt tên trong cùng dự án.
- Angular service: `product-api.service.ts`, `try-on-api.service.ts`.
- Angular model/type: `product.model.ts`, `try-on-job.model.ts` hoặc `*.types.ts`; chọn một quy ước và áp dụng thống nhất.
- Angular route config: `catalog.routes.ts`, `virtual-try-on.routes.ts`.
- .NET project/namespace: `FashionAI.Api`, `FashionAI.Application`, `FashionAI.Domain`, `FashionAI.Infrastructure`; dùng PascalCase.
- Python module/file: `snake_case`, ví dụ `visual_search.py`, `try_on.py`, `embedding_service.py`.
- Tránh tên mơ hồ như `common2`, `new-service`, `data-final`, `helper`; đặt tên thể hiện trách nhiệm.

## 4. Cách xử lý cây hiện tại

| Thành phần hiện tại | Đề xuất |
|---|---|
| `core/cms/adapters/strapi.adapter.ts`, `payload.adapter.ts` | Bỏ adapter không dùng. Chỉ giữ CMS abstraction nếu có yêu cầu thật sự tích hợp CMS độc lập. |
| `core/cms/repositories/cms.repository.ts` | Chỉ giữ nếu có nhiều nguồn CMS cần hoán đổi; nếu không, dùng `content` feature và API từ ASP.NET Core. |
| `core/data/mock-services.ts` | Chuyển sang `testing/mocks/`; chỉ bật cho development/test. |
| `core/services/api.service.ts` | Giữ API client chung thật mỏng hoặc đổi thành `api-client.service.ts`; API nghiệp vụ đặt trong `features/*/data-access/`. |
| `core/models/cms-content.model.ts` | Chuyển về `features/content/models/` nếu content thực sự cần model riêng. |
| `features/portfolio`, `features/pricing`, `features/services` | Bỏ nếu không thuộc yêu cầu TMĐT; hoặc chuyển thành `content/` nếu là trang nội dung thật sự cần. |
| `features/about`, `blog`, `contact`, `faq` | Chuyển vào `features/content/` và coi là chức năng phụ, không ưu tiên trước TMĐT/AI. |
| `shared/ui/contact-form/` | Có thể giữ nếu được nhiều trang sử dụng; nếu chỉ dùng ở Contact thì đặt trong feature đó. |
| `safe-html.pipe.ts` | Rà soát nơi sử dụng và bảo đảm HTML CMS được làm sạch; không bypass sanitizer với nội dung không tin cậy. |
| `app.config.server.ts`, `app.routes.server.ts`, `main.server.ts`, `server.ts` | Giữ nếu dự án thật sự bật SSR; nếu chưa dùng SSR, không cần duy trì cấu hình server dư thừa. |
| `environment.*.ts` | Chỉ chứa cấu hình client không bí mật, ví dụ API URL; mọi secret chỉ nằm phía server/secret store. |

## 5. Ranh giới trách nhiệm

- **Angular:** hiển thị giao diện, kiểm tra dữ liệu cơ bản, gọi backend; không truy cập SQL Server trực tiếp.
- **ASP.NET Core:** xác thực/phân quyền, nghiệp vụ TMĐT, dữ liệu sản phẩm/giá/tồn kho/đơn hàng, ghi lịch sử AI và điều phối AI.
- **SQL Server:** dữ liệu quan hệ có cấu trúc. Ảnh lớn không nên lưu trực tiếp dạng blob nếu không có yêu cầu đặc biệt.
- **Object storage:** ảnh sản phẩm, ảnh người dùng và kết quả thử đồ; ảnh riêng tư mặc định phải được bảo vệ.
- **AI Service:** IDM-VTON inference và SigLIP/FAISS retrieval. Không quản lý tài khoản, giá, tồn kho hay thanh toán.
- **FAISS index:** chỉ mục tìm kiếm có thể tái tạo; cần lưu mapping vector ID với ProductImage/Product ID ở nơi bền vững.

## 6. Thứ tự triển khai đề xuất

1. Kiểm tra repository và thống nhất tên thư mục/namespace.
2. Khởi tạo backend, EF Core, SQL Server và migrations.
3. Làm Angular shell, routing, auth và catalog bằng API thật.
4. Hoàn thiện cart, checkout, orders, wishlist, reviews và admin.
5. Tạo storage abstraction, xác thực upload và API contract cho AI.
6. Làm Visual Search và đánh giá Recall@K/Precision@K hoặc mAP khi có nhãn đánh giá phù hợp.
7. Tích hợp IDM-VTON sau khi xác minh checkpoint, license, dependency và yêu cầu GPU/VRAM.
8. Kiểm thử tích hợp, E2E, bảo mật, triển khai và hoàn thiện tài liệu đồ án.

## 7. Lưu ý

Cây thư mục này là mục tiêu kiến trúc, không có nghĩa phải tạo ngay toàn bộ folder rỗng. Tạo theo từng giai đoạn và chỉ thêm abstraction khi có lý do kỹ thuật rõ ràng. Trước khi chỉnh repository hiện tại, hãy kiểm tra package Angular, phiên bản .NET, trạng thái SSR và code đã có để tránh di chuyển file gây hỏng build.
