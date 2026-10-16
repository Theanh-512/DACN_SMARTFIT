# Virtual Try-On Repository Audit & Technical Assessment

**Document Version:** 1.0.0  
**Date:** October 16, 2026  
**Auditor:** Senior Full-Stack, 3D Graphics & Applied AI Systems Engineer  
**Scope:** Architecture, 3D Avatar Rendering, Face Personalization, Garment Visualization, Sizing Engine, and E-Commerce Integration.

---

## 1. Current Architecture

```
[Angular 20 SPA] (Port 4200)
  ├── 3D Viewport: Google <model-viewer> Web Component & Three.js r128
  ├── State Management: Angular Signals (cart, catalog, try-on)
  ├── Catalog & Cart: ProductStateService, CartService (LocalStorage & InMemory)
  └── Services: Avatar3dService, CartService, SeoService
         │
         │ REST HTTP (JSON, FormData, multipart/form-data)
         ▼
[Python FastAPI AI Microservice] (Port 8000)
  ├── 3D Mesh & Anthropometry:
  │     ├── iso_measurements.py: ISO 8559-1 calculations & SMPL-X beta mapping
  │     └── mesh_generator.py: Procedural humanoid lofting, garment meshes, GLB export
  ├── Explainable Sizing Engine:
  │     └── recommender.py: Garment finished measurements, asymmetric penalty scoring
  ├── 2D Virtual Try-On:
  │     └── orchestrator.py: IDM-VTON / OpenPose / DensePose image pipeline
  └── Visual Search:
        └── SigLIP ViT + FAISS index
```

---

## 2. Confirmed Defects and Source Files

| ID | Component | Source File | Confirmed Defect Description | Impact |
|---|---|---|---|---|
| **DEF-01** | 3D Geometry | `ai-service/app/anthropometry/mesh_generator.py` | Procedural limbs and torso were built with unaligned cylinders and flat shading, leading to a faceted "wooden dummy" / robot appearance. | High (User explicitly reported avatar looks crude and non-humanoid). |
| **DEF-02** | Body Presets | `frontend/.../try-on-page.component.ts` | Body type options were generic labels (`regular`, `ectomorph`, `mesomorph`, `endomorph`, `hourglass`) that lacked gender-specific archetypes required by modern fashion fitting (Male: Regular, Slim, Athletic, Broad; Female: Regular, Slim, Curvy, Hourglass). | Medium (Reduced fidelity and user customization options). |
| **DEF-03** | Face Personalization | `ai-service/app/api/routes/avatar.py` | `upload-photo-reconstruct` saved uploaded images directly to disk without size/type validation, consent verification, or privacy policy compliance. | Critical (Privacy & Security Risk). |
| **DEF-04** | Mode Confusion | `try-on-page.component.html` | The interface previously mixed 3D mesh rendering with 2D virtual try-on concepts without distinct tabs or explanations, confusing users about whether they were viewing a 3D garment or an AI-generated 2D photo. | High (Product goal violation: "Do not falsely present 2D try-on as 3D simulation"). |
| **DEF-05** | Garment Realism | `ai-service/app/anthropometry/mesh_generator.py` | Garment mesh generation created a generic tube shape regardless of product category (cardigan vs t-shirt vs parka) without texture mapping or real product variant colors. | High (Lack of product-specific visualization). |
| **DEF-06** | Sizing Disconnection | `try-on-page.component.ts` | Sizing diagnostic was tightly coupled to geometric mesh penetration rather than the deterministic, explainable sizing service in `app/sizing/recommender.py`. | High (Product goal: "A geometric collision is not a validated measure of fabric tension"). |

---

## 3. Reusable Components

1. **Angular Shopping Infrastructure**:
   - `CartService`: Fully functional reactive cart with `addItem`, `updateQuantity`, `removeItem`, `subtotal`, `shippingFee`, and `total`.
   - `ProductStateService` & `MOCK_PRODUCTS`: Authentic clothing catalog with categories (`cat-tshirts`, `cat-jackets`, `cat-pants`, `cat-shirts`), variants (size, color, stock, SKU), and real photography.
2. **Explainable Sizing Engine** (`ai-service/app/sizing/recommender.py`):
   - Comprehensive garment finished measurements for LifeWear categories.
   - Asymmetric penalty model penalizing tightness more than looseness.
   - Full measurement delta breakdown (`chest`, `shoulder`, `waist`, `hip`).
3. **2D VTON Pipeline** (`ai-service/app/tryon/`):
   - Input image validator (`validator.py` checking resolution, aspect ratio, blur, illumination).
   - Orchestrator handling background job states and diagnostics.
4. **Anthropometry Engine** (`ai-service/app/anthropometry/iso_measurements.py`):
   - ISO 8559-1 formulas calculating accurate circumferences from stature and weight.

---

## 4. Dependencies and Assets Inventory

| Asset / Dependency | Location | Current Status | License / Source |
|---|---|---|---|
| `smplx` (Python library) | `ai-service/smplx` | **Installed** (`smplx==0.1.28`) | Academic / Research (SMPL-X Project) |
| `Focused-human-body-measurement` | `ai-service/Focused-human-body-measurement` | **Cloned** | CVPR 2025 (Open Research) |
| `trimesh` | Python environment | **Installed** (5.1.1) | MIT License |
| `<model-viewer>` | `src/index.html` | **Loaded** (v4.0.0 CDN) | Apache 2.0 (Google) |
| `three.js` | `src/index.html` | **Loaded** (r128 CDN) | MIT License |
| SMPL-X Trained Weights (`.npz`/`.pkl`) | External | **Not bundled in git** (Requires MPI license registration) | Restricted (Requires individual registration) |
| Realistic 3D Mannequin Templates | `frontend/.../assets/models/` | **Generated procedural GLBs** | Custom procedural under MIT |

---

## 5. Licensing and Hardware Risks

1. **SMPL-X & Pretrained Checkpoints**: Official MPI SMPL-X models require user registration on `smpl-x.is.tue.mpg.de`. To ensure zero licensing infringement and 100% legal compliance for open deployment, the real-time application utilizes an open parametric anatomical lofting model adhering to ISO 8559-1 without redistributing restricted proprietary binary weights.
2. **GPU Hardware Constraints**: The local execution environment operates on CPU (`cuda_available: false`). Heavy diffusion models (IDM-VTON 2D inference) or NeRF pipelines cannot execute synchronously under 2 seconds. The system must clearly report 2D inference availability/status and rely on real-time deterministic 3D rendering (< 200ms) for interactive shopping.

---

## 6. Prioritized Implementation Plan

1. **Phase 1: Realistic 3D Mannequin & Presets**:
   - Upgrade mesh generator with continuous organic geometry, smooth vertex normals, anatomical muscle tone, realistic head/facial contour, hands, and feet.
   - Implement structured body presets:
     - Male: *Cân đối (Regular)*, *Thanh mảnh (Slim)*, *Thể thao (Athletic)*, *Khung to (Broad)*.
     - Female: *Cân đối (Regular)*, *Thon thả (Slim)*, *Đầy đặn (Curvy)*, *Đồng hồ cát (Hourglass)*.
   - Connect height and shape scaling with stable proportions and camera auto-framing.
2. **Phase 2: Modular Face Personalization & Privacy Controls**:
   - Implement face detection (OpenCV Haar Cascade / Face Landmark) on uploaded portraits.
   - Crop and project face texture onto 3D head mesh with clear labelling as approximation.
   - Add explicit Vietnamese privacy notice, consent checkbox, file validation (format, size < 5MB), and a "Xóa dữ liệu ảnh" (Delete Avatar Data) button.
3. **Phase 3: Product-Specific Garment Visualization & 2D VTON Separation**:
   - Provide distinct 3D garment geometries: Cardigan (V-neck, button placket), T-shirt (crewneck, short sleeves), Parka (hooded collar, zip line), Pants.
   - Clearly separate **3D Khung cảnh thời trang** vs **2D AI Thử đồ ảo (Image-based VTON)** with separate tabs and honest visual status indicators.
4. **Phase 4: Sizing Service Integration & Explainability**:
   - Wire the frontend directly to `/api/v1/sizing/recommend`.
   - Display real ease allowance (dư cử động), confidence score, measurement breakdown, and actionable recommendation (Size up, Size down, or Keep).
5. **Phase 5: Seamless Shopping & Cart Flow**:
   - Connect "Đổi sang size đề xuất" to actual variant selection.
   - Connect "Thêm vào giỏ hàng" to `CartService.addItem` with exact SKU, variant price, and real feedback notification.
6. **Phase 6 & 7: UI Polish, Security, and Automated Tests**:
   - Refine CSS into a luxury minimalist fashion aesthetic.
   - Add unit tests for presets, sizing, face validation, and cart integration.
