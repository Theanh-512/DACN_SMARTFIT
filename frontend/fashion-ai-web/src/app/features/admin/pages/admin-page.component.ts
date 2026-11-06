import { Component, OnInit, AfterViewInit, OnDestroy, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { SeoService } from '../../../core/services/seo.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ProductStateService, AdminOrder } from '../../../core/services/product-state.service';
import { GarmentStudioService, GarmentProduct, GarmentVariant, GarmentAsset } from '../../../core/services/garment-studio.service';
import { Product, ProductVariant } from '../../catalog/models/product.model';
import { Category } from '../../../core/data/mock-products';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit, AfterViewInit, OnDestroy {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);
  readonly productState = inject(ProductStateService);
  readonly garmentStudio = inject(GarmentStudioService);

  @ViewChild('studio3dCanvas') studio3dCanvasRef?: ElementRef<HTMLCanvasElement>;
  private studioScene: THREE.Scene | null = null;
  private studioCamera: THREE.PerspectiveCamera | null = null;
  private studioRenderer: THREE.WebGLRenderer | null = null;
  private studioControls: OrbitControls | null = null;
  private studioCurrentMesh: THREE.Group | null = null;
  private studioAnimId: number | null = null;

  // Active navigation tab in Admin
  activeTab = signal<'dashboard' | 'products' | 'categories' | 'inventory' | 'orders' | 'users' | 'garment3d'>('dashboard');

  // --- TAB: AI Garment Studio (Phase 4 & Persistent Catalog) ---
  garment3dId = signal<string>('prod_' + Date.now().toString(36));
  garment3dSku = signal<string>('SKU-TSHIRT-001');
  garment3dName = signal<string>('Áo Thun Cotton Oversized Premium');
  garment3dType = signal<'tshirt' | 'shirt' | 'cardigan' | 'jacket'>('tshirt');
  garment3dDesc = signal<string>('Áo thun cotton cao cấp phom dáng vừa vặn chuẩn kích thước may mặc ISO 8559.');
  garment3dMaterial = signal<string>('100% Cotton Single Jersey');
  garment3dStretch = signal<number>(5.0);
  garment3dThickness = signal<number>(1.5);
  garment3dColorHex = signal<string>('#19284B');
  garment3dPattern = signal<string>('Trơn màu tự nhiên (Solid PBR)');
  garment3dNotes = signal<string>('Dựng rập tham số theo công nghệ GarmentCode (Apache 2.0).');

  garment3dImagePreview = signal<string>('/assets/products/tshirt_front.png');
  garment3dFile = signal<File | null>(null);
  garment3dBackImagePreview = signal<string | null>(null);
  garment3dBackFile = signal<File | null>(null);
  garment3dMaskPreview = signal<string | null>(null);
  garment3dTexturePreview = signal<string | null>(null);

  garment3dMissingViewWarning = signal<string | null>(
    'Lưu ý: Chỉ có ảnh mặt trước. Mặt sau sẽ được suy diễn tự động (inferred) từ màu chủ đạo và chất liệu của mặt trước.'
  );
  garment3dAspectWarning = signal<string | null>(null);
  garment3dDrapeMode = signal<'pushout' | 'blender'>('pushout');

  garment3dJobState = signal<'draft' | 'processing' | 'ready_for_review' | 'published' | 'failed'>('draft');
  garment3dProgressPct = signal<number>(0);
  garment3dCompletedSizes = signal<string[]>([]);
  isGeneratingGarment3d = signal<boolean>(false);
  isAnalyzingImage = signal<boolean>(false);
  isPublishingGarment = signal<boolean>(false);

  previewGarmentSize = signal<string>('M');
  previewGarmentGlbUrl = signal<string>('/assets/garments/prod_tshirt_cotton_m.glb');
  garment3dProductResult = signal<GarmentProduct | null>(null);

  garment3dSizes = signal<{ [key: string]: { chest: number; length: number; shoulder: number; sleeve: number; hem: number; neck: number; armhole: number } }>({
    'XS':  { chest: 44.0, length: 63.0, shoulder: 41.0, sleeve: 18.5, hem: 44.0, neck: 38.0, armhole: 23.0 },
    'S':   { chest: 47.0, length: 66.0, shoulder: 43.0, sleeve: 19.5, hem: 47.0, neck: 39.0, armhole: 24.0 },
    'M':   { chest: 50.0, length: 69.0, shoulder: 45.0, sleeve: 20.5, hem: 50.0, neck: 40.0, armhole: 25.0 },
    'L':   { chest: 53.0, length: 72.0, shoulder: 47.0, sleeve: 21.5, hem: 53.0, neck: 41.5, armhole: 26.0 },
    'XL':  { chest: 56.5, length: 74.5, shoulder: 49.5, sleeve: 22.5, hem: 56.5, neck: 43.0, armhole: 27.0 },
    'XXL': { chest: 60.5, length: 77.0, shoulder: 52.0, sleeve: 23.5, hem: 60.5, neck: 44.5, armhole: 28.5 }
  });

  // Search & Filter in Admin
  productSearch = signal<string>('');
  productCategoryFilter = signal<string>('all');
  orderStatusFilter = signal<string>('all');

  // Computed filtered products for Admin Table
  filteredProducts = computed(() => {
    const list = this.productState.products();
    const query = this.productSearch().toLowerCase().trim();
    const cat = this.productCategoryFilter();

    return list.filter(p => {
      const matchQuery = !query || p.name.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query);
      const matchCat = cat === 'all' || p.categoryId === cat;
      return matchQuery && matchCat;
    });
  });

  // Computed filtered orders
  filteredOrders = computed(() => {
    const list = this.productState.orders();
    const status = this.orderStatusFilter();
    if (status === 'all') return list;
    return list.filter(o => o.status === status);
  });

  // Feedback notification message
  adminMessage = signal<string | null>(null);

  // --- MODAL: Add New Product Form State ---
  isAddModalOpen = signal<boolean>(false);
  newProductName = signal('');
  newProductCategory = signal('cat-women-tops');
  newProductBasePrice = signal<number>(499000);
  newProductOriginalPrice = signal<number>(649000);
  newProductThumbnail = signal('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
  newProductGarment = signal('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
  newProductColor = signal('Đen');
  newProductSizes = signal('S, M, L');
  newProductStock = signal<number>(30);
  newProductDescription = signal('Thiết kế tối giản hiện đại, chất liệu tự nhiên thân thiện với môi trường theo triết lý LifeWear.');
  newProductFeatured = signal(true);
  newProductInStock = signal(true);

  // --- MODAL: Edit Existing Product Form State ---
  isEditModalOpen = signal<boolean>(false);
  editingProductId = signal<string | null>(null);
  editProductName = signal('');
  editProductCategory = signal('');
  editProductBasePrice = signal<number>(0);
  editProductOriginalPrice = signal<number>(0);
  editProductThumbnail = signal('');
  editProductDescription = signal('');
  editProductInStock = signal<boolean>(true);

  // --- MODAL: View Order Detail State ---
  selectedOrder = signal<AdminOrder | null>(null);

  // --- MODAL: Add Category State ---
  isAddCategoryOpen = signal<boolean>(false);
  newCategoryName = signal('');
  newCategorySlug = signal('');
  newCategoryGender = signal<'women' | 'men' | 'kids' | 'unisex'>('women');
  newCategoryImageUrl = signal('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80');

  // --- MODAL: Add User State ---
  isAddUserOpen = signal<boolean>(false);
  newUserName = signal('');
  newUserEmail = signal('');
  newUserRole = signal<UserRole>('customer');

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Quản Trị Hệ Thống (Admin Backoffice) | Fashion AI Studio',
      description: 'Cổng thông tin quản trị toàn diện: setup sản phẩm, danh mục, tồn kho, đơn hàng và phân quyền vai trò.',
      keywords: 'Admin, Backoffice, quản trị sản phẩm, phân quyền vai trò'
    });

    if (this.router.url.includes('garment-studio') || this.route.snapshot.queryParamMap.get('tab') === 'garment3d') {
      this.selectTab('garment3d');
    }
  }

  ngAfterViewInit(): void {
    if (this.activeTab() === 'garment3d') {
      setTimeout(() => this.initStudio3d(), 100);
    }
  }

  ngOnDestroy(): void {
    if (this.studioAnimId !== null) {
      cancelAnimationFrame(this.studioAnimId);
    }
    if (this.studioRenderer) {
      this.studioRenderer.dispose();
    }
  }

  selectTab(tab: 'dashboard' | 'products' | 'categories' | 'inventory' | 'orders' | 'users' | 'garment3d'): void {
    this.activeTab.set(tab);
    if (tab === 'garment3d') {
      setTimeout(() => this.initStudio3d(), 150);
    }
  }

  // --- Three.js Studio 3D Interactive Viewer ---

  initStudio3d(): void {
    if (!this.studio3dCanvasRef) return;
    const canvas = this.studio3dCanvasRef.nativeElement;
    const width = canvas.clientWidth || 480;
    const height = canvas.clientHeight || 450;

    if (!this.studioScene) {
      this.studioScene = new THREE.Scene();
      this.studioScene.background = new THREE.Color(0x13131a);

      this.studioCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10);
      this.studioCamera.position.set(0, 0.1, 1.8);

      this.studioRenderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      this.studioRenderer.setSize(width, height);
      this.studioRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.studioRenderer.shadowMap.enabled = true;

      this.studioControls = new OrbitControls(this.studioCamera, canvas);
      this.studioControls.enableDamping = true;
      this.studioControls.dampingFactor = 0.05;
      this.studioControls.target.set(0, 0, 0);
      this.studioControls.minDistance = 0.5;
      this.studioControls.maxDistance = 3.5;

      // Lights
      const ambient = new THREE.AmbientLight(0xffffff, 0.85);
      this.studioScene.add(ambient);

      const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight1.position.set(2, 3, 2);
      this.studioScene.add(dirLight1);

      const dirLight2 = new THREE.DirectionalLight(0x90a0d0, 0.6);
      dirLight2.position.set(-2, 1, -2);
      this.studioScene.add(dirLight2);

      // Grid
      const grid = new THREE.GridHelper(2, 20, 0x333345, 0x222230);
      grid.position.y = -0.65;
      this.studioScene.add(grid);

      // Render loop
      const animate = () => {
        this.studioAnimId = requestAnimationFrame(animate);
        if (this.studioControls) this.studioControls.update();
        if (this.studioRenderer && this.studioScene && this.studioCamera) {
          this.studioRenderer.render(this.studioScene, this.studioCamera);
        }
      };
      animate();
    } else {
      if (this.studioRenderer && this.studioCamera) {
        this.studioRenderer.setSize(width, height);
        this.studioCamera.aspect = width / height;
        this.studioCamera.updateProjectionMatrix();
      }
    }

    this.loadStudioGlb(this.previewGarmentGlbUrl());
  }

  loadStudioGlb(url: string): void {
    if (!this.studioScene) return;

    if (this.studioCurrentMesh) {
      this.studioScene.remove(this.studioCurrentMesh);
      this.studioCurrentMesh.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const m = child as THREE.Mesh;
          if (m.geometry) m.geometry.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach(mat => mat.dispose());
          } else if (m.material) {
            m.material.dispose();
          }
        }
      });
      this.studioCurrentMesh = null;
    }

    const loader = new GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        this.studioCurrentMesh = gltf.scene;

        // Center mesh
        const box = new THREE.Box3().setFromObject(this.studioCurrentMesh);
        const center = box.getCenter(new THREE.Vector3());
        this.studioCurrentMesh.position.sub(center);

        if (this.studioScene) {
          this.studioScene.add(this.studioCurrentMesh);
        }
      },
      undefined,
      (err) => {
        console.warn('Could not load studio 3D GLB:', url, err);
      }
    );
  }

  setStudioCameraAngle(angle: 'front' | 'side' | 'back'): void {
    if (!this.studioCamera || !this.studioControls) return;
    if (angle === 'front') {
      this.studioCamera.position.set(0, 0.1, 1.8);
    } else if (angle === 'side') {
      this.studioCamera.position.set(1.8, 0.1, 0);
    } else if (angle === 'back') {
      this.studioCamera.position.set(0, 0.1, -1.8);
    }
    this.studioControls.target.set(0, 0, 0);
    this.studioControls.update();
  }

  // --- Category Change & Measurement Presets ---

  onGarment3dCategoryChange(newCat: 'tshirt' | 'shirt' | 'cardigan' | 'jacket'): void {
    this.garment3dType.set(newCat);
    const prefix = newCat.toUpperCase();
    this.garment3dSku.set(`SKU-${prefix}-${Date.now().toString().slice(-4)}`);
    this.loadCategoryDefaultSizes(newCat);
  }

  loadCategoryDefaultSizes(cat?: 'tshirt' | 'shirt' | 'cardigan' | 'jacket'): void {
    const category = cat || this.garment3dType();
    if (category === 'tshirt') {
      this.garment3dSizes.set({
        'XS':  { chest: 44.0, length: 63.0, shoulder: 41.0, sleeve: 18.5, hem: 44.0, neck: 38.0, armhole: 23.0 },
        'S':   { chest: 47.0, length: 66.0, shoulder: 43.0, sleeve: 19.5, hem: 47.0, neck: 39.0, armhole: 24.0 },
        'M':   { chest: 50.0, length: 69.0, shoulder: 45.0, sleeve: 20.5, hem: 50.0, neck: 40.0, armhole: 25.0 },
        'L':   { chest: 53.0, length: 72.0, shoulder: 47.0, sleeve: 21.5, hem: 53.0, neck: 41.5, armhole: 26.0 },
        'XL':  { chest: 56.5, length: 74.5, shoulder: 49.5, sleeve: 22.5, hem: 56.5, neck: 43.0, armhole: 27.0 },
        'XXL': { chest: 60.5, length: 77.0, shoulder: 52.0, sleeve: 23.5, hem: 60.5, neck: 44.5, armhole: 28.5 }
      });
      this.garment3dMaterial.set('100% Cotton Single Jersey');
      this.garment3dStretch.set(5.0);
      this.garment3dThickness.set(1.5);
    } else if (category === 'shirt') {
      this.garment3dSizes.set({
        'XS':  { chest: 47.0, length: 68.0, shoulder: 43.0, sleeve: 58.0, hem: 46.0, neck: 38.0, armhole: 23.5 },
        'S':   { chest: 50.0, length: 71.0, shoulder: 45.0, sleeve: 60.0, hem: 49.0, neck: 39.0, armhole: 24.5 },
        'M':   { chest: 53.0, length: 74.0, shoulder: 47.0, sleeve: 62.0, hem: 52.0, neck: 40.5, armhole: 25.5 },
        'L':   { chest: 56.0, length: 76.0, shoulder: 49.0, sleeve: 63.5, hem: 55.0, neck: 42.0, armhole: 26.5 },
        'XL':  { chest: 59.0, length: 78.0, shoulder: 51.0, sleeve: 65.0, hem: 58.0, neck: 43.5, armhole: 27.5 },
        'XXL': { chest: 62.0, length: 80.0, shoulder: 53.0, sleeve: 66.5, hem: 61.0, neck: 45.0, armhole: 28.5 }
      });
      this.garment3dMaterial.set('100% Oxford Cotton Woven');
      this.garment3dStretch.set(2.0);
      this.garment3dThickness.set(1.8);
    } else if (category === 'cardigan') {
      this.garment3dSizes.set({
        'XS':  { chest: 48.0, length: 64.0, shoulder: 44.0, sleeve: 56.0, hem: 44.0, neck: 39.0, armhole: 24.0 },
        'S':   { chest: 51.0, length: 67.0, shoulder: 46.0, sleeve: 58.0, hem: 47.0, neck: 40.0, armhole: 25.0 },
        'M':   { chest: 54.0, length: 70.0, shoulder: 48.0, sleeve: 60.0, hem: 50.0, neck: 41.0, armhole: 26.0 },
        'L':   { chest: 57.0, length: 72.0, shoulder: 50.0, sleeve: 61.5, hem: 53.0, neck: 42.0, armhole: 27.0 },
        'XL':  { chest: 60.0, length: 74.0, shoulder: 52.0, sleeve: 63.0, hem: 56.0, neck: 43.5, armhole: 28.0 },
        'XXL': { chest: 63.0, length: 76.0, shoulder: 54.0, sleeve: 64.5, hem: 59.0, neck: 45.0, armhole: 29.0 }
      });
      this.garment3dMaterial.set('Merino Wool Blend Knit');
      this.garment3dStretch.set(12.0);
      this.garment3dThickness.set(2.8);
    } else if (category === 'jacket') {
      this.garment3dSizes.set({
        'XS':  { chest: 51.0, length: 65.0, shoulder: 45.0, sleeve: 59.0, hem: 48.0, neck: 41.0, armhole: 25.0 },
        'S':   { chest: 54.0, length: 68.0, shoulder: 47.0, sleeve: 61.0, hem: 51.0, neck: 42.0, armhole: 26.0 },
        'M':   { chest: 57.0, length: 71.0, shoulder: 49.0, sleeve: 63.0, hem: 54.0, neck: 43.0, armhole: 27.0 },
        'L':   { chest: 60.0, length: 73.0, shoulder: 51.0, sleeve: 64.5, hem: 57.0, neck: 44.5, armhole: 28.0 },
        'XL':  { chest: 63.0, length: 75.0, shoulder: 53.0, sleeve: 66.0, hem: 60.0, neck: 46.0, armhole: 29.0 },
        'XXL': { chest: 66.0, length: 77.0, shoulder: 55.0, sleeve: 67.5, hem: 63.0, neck: 47.5, armhole: 30.0 }
      });
      this.garment3dMaterial.set('Structured Twill Cotton');
      this.garment3dStretch.set(1.5);
      this.garment3dThickness.set(2.4);
    }
    this.showMessage(`Đã nạp bảng số đo tham số ISO chuẩn cho ngành hàng: ${category.toUpperCase()}`);
  }

  // --- Image Handling & AI Texture Extraction ---

  onGarment3dFrontFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.garment3dFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.garment3dImagePreview.set(e.target?.result as string);
        this.autoAnalyzeImage(file);
      };
      reader.readAsDataURL(file);
    }
  }

  onGarment3dBackFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.garment3dBackFile.set(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.garment3dBackImagePreview.set(e.target?.result as string);
        this.garment3dMissingViewWarning.set(null);
      };
      reader.readAsDataURL(file);
    } else {
      this.garment3dBackFile.set(null);
      this.garment3dBackImagePreview.set(null);
      this.garment3dMissingViewWarning.set(
        'Lưu ý: Chỉ có ảnh mặt trước. Mặt sau sẽ được suy diễn tự động (inferred) từ màu chủ đạo và chất liệu của mặt trước.'
      );
    }
  }

  autoAnalyzeImage(file: File): void {
    this.isAnalyzingImage.set(true);
    const fd = new FormData();
    fd.append('file', file);
    fd.append('category', this.garment3dType());

    this.garmentStudio.processStudioImage(fd).subscribe({
      next: (res) => {
        this.isAnalyzingImage.set(false);
        if (res.dominant_hex) {
          this.garment3dColorHex.set(res.dominant_hex);
        }
        if (res.mask_url) {
          this.garment3dMaskPreview.set(res.mask_url);
        }
        if (res.texture_url) {
          this.garment3dTexturePreview.set(res.texture_url);
        }
        if (res.aspect_warning && res.aspect_warning.is_deviated) {
          this.garment3dAspectWarning.set(res.aspect_warning.message);
        } else {
          this.garment3dAspectWarning.set(null);
        }
        this.showMessage('AI đã tách nền, trích xuất màu sắc PBR và silhouette từ ảnh thành công!');
      },
      error: (err) => {
        this.isAnalyzingImage.set(false);
        console.warn('Auto image analysis error, using fallback:', err);
      }
    });
  }

  // --- Generation Pipeline (Phase 4 & 5) ---

  generateGarment3d(): void {
    this.isGeneratingGarment3d.set(true);
    this.garment3dJobState.set('processing');
    this.garment3dProgressPct.set(20);

    const payload = {
      product_id: this.garment3dId(),
      sku: this.garment3dSku(),
      name: this.garment3dName(),
      category: this.garment3dType(),
      description: this.garment3dDesc(),
      material: this.garment3dMaterial(),
      stretch_pct: this.garment3dStretch(),
      thickness_mm: this.garment3dThickness(),
      primary_color_hex: this.garment3dColorHex(),
      pattern_description: this.garment3dPattern(),
      design_notes: this.garment3dNotes(),
      drape_mode: this.garment3dDrapeMode(),
      sizes: this.garment3dSizes(),
      front_image: this.garment3dImagePreview(),
      back_image: this.garment3dBackImagePreview()
    };

    this.garmentStudio.generate3d(payload).subscribe({
      next: (progress) => {
        this.isGeneratingGarment3d.set(false);
        this.garment3dProgressPct.set(100);
        this.garment3dCompletedSizes.set(progress.completed_sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL']);

        if (progress.product) {
          this.garment3dProductResult.set(progress.product);
        }
        this.garment3dJobState.set('ready_for_review');

        // Update preview GLB
        const curSz = this.previewGarmentSize();
        const glbUrl = `/assets/garments/${this.garment3dId()}/sizes/${curSz}/garment-v1.glb`;
        this.previewGarmentGlbUrl.set(glbUrl);
        this.loadStudioGlb(glbUrl);

        this.showMessage('✓ Đã dựng xong mô hình 3D cho tất cả 6 kích cỡ! Mời bạn xoay nghiệm thu.');
      },
      error: (err) => {
        this.isGeneratingGarment3d.set(false);
        this.garment3dJobState.set('failed');
        console.error('Garment generation failed:', err);
        alert('Có lỗi khi tạo rập 3D. Vui lòng kiểm tra lại dịch vụ backend Python (port 8001).');
      }
    });
  }

  setPreviewGarmentSize(sz: string): void {
    this.previewGarmentSize.set(sz);
    const prodResult = this.garment3dProductResult();
    let url = `/assets/garments/${this.garment3dId()}/sizes/${sz}/garment-v1.glb`;

    if (prodResult && prodResult.assets) {
      const glbAsset = prodResult.assets.find(a => a.asset_type === 'glb' && a.size === sz);
      if (glbAsset && glbAsset.public_url) {
        url = glbAsset.public_url;
      }
    } else {
      // Fallback if not yet generated
      const cat = this.garment3dType();
      url = `/assets/garments/${cat === 'cardigan' ? 'prod_cardigan_knit' : 'prod_tshirt_cotton'}_${sz.toLowerCase()}.glb`;
    }

    this.previewGarmentGlbUrl.set(url);
    this.loadStudioGlb(url);
  }

  publishGarmentProduct(): void {
    if (this.garment3dJobState() !== 'ready_for_review') {
      alert('Vui lòng tạo 3D và nghiệm thu trước khi xuất bản vào Catalog!');
      return;
    }

    this.isPublishingGarment.set(true);
    this.garmentStudio.publishProduct(this.garment3dId()).subscribe({
      next: (pub) => {
        this.isPublishingGarment.set(false);
        this.garment3dJobState.set('published');
        this.garment3dProductResult.set(pub);

        // Add to live ProductState so Virtual Try-On sees it instantly
        this.productState.addPublishedProduct(pub);
        this.showMessage(`✓ Đã lưu sản phẩm "${pub.name}" vào danh mục 3D bền vững và xuất bản thành công!`);
      },
      error: (err) => {
        this.isPublishingGarment.set(false);
        console.error('Failed to publish product:', err);
        // Fallback local registration
        const fallbackProd = this.garment3dProductResult();
        if (fallbackProd) {
          fallbackProd.status = 'published';
          this.garment3dJobState.set('published');
          this.productState.addPublishedProduct(fallbackProd);
          this.showMessage('✓ Đã xuất bản sản phẩm vào danh mục hiển thị của hệ thống!');
        }
      }
    });
  }

  // --- Product Operations ---

  openAddProductModal(): void {
    this.newProductName.set('');
    this.newProductBasePrice.set(499000);
    this.newProductOriginalPrice.set(649000);
    this.newProductCategory.set(this.productState.categories()[0]?.id || 'cat-women-tops');
    this.isAddModalOpen.set(true);
  }

  closeAddProductModal(): void {
    this.isAddModalOpen.set(false);
  }

  saveNewProduct(): void {
    const name = this.newProductName().trim();
    if (!name) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }

    const categoryObj = this.productState.categories().find(c => c.id === this.newProductCategory());
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const sizes = this.newProductSizes().split(',').map(s => s.trim()).filter(Boolean);
    const color = this.newProductColor().trim() || 'Tiêu chuẩn';
    const stockPerVariant = Math.max(1, Math.floor(this.newProductStock() / (sizes.length || 1)));

    const variants: ProductVariant[] = (sizes.length ? sizes : ['F']).map((size, index) => ({
      id: `v-${Date.now()}-${index}`,
      sku: `${slug.substring(0, 6).toUpperCase()}-${color.substring(0, 3).toUpperCase()}-${size}`,
      size,
      color,
      stockQuantity: stockPerVariant,
      priceModifier: 0,
      garmentImageUrl: this.newProductGarment() || this.newProductThumbnail()
    }));

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      slug,
      description: this.newProductDescription(),
      categoryId: this.newProductCategory(),
      categoryName: categoryObj?.name || 'Áo',
      basePrice: this.newProductBasePrice(),
      originalPrice: this.newProductOriginalPrice() || undefined,
      thumbnailUrl: this.newProductThumbnail(),
      images: [
        this.newProductThumbnail(),
        this.newProductGarment()
      ],
      variants,
      inStock: this.newProductInStock(),
      featured: this.newProductFeatured()
    };

    this.productState.addProduct(newProd);
    this.closeAddProductModal();
    this.showMessage(`Đã setup và tạo thành công sản phẩm: "${name}"!`);
  }

  openEditProductModal(product: Product): void {
    this.editingProductId.set(product.id);
    this.editProductName.set(product.name);
    this.editProductCategory.set(product.categoryId);
    this.editProductBasePrice.set(product.basePrice);
    this.editProductOriginalPrice.set(product.originalPrice || product.basePrice);
    this.editProductThumbnail.set(product.thumbnailUrl);
    this.editProductDescription.set(product.description);
    this.editProductInStock.set(product.inStock);
    this.isEditModalOpen.set(true);
  }

  closeEditProductModal(): void {
    this.isEditModalOpen.set(false);
    this.editingProductId.set(null);
  }

  saveEditProduct(): void {
    const id = this.editingProductId();
    if (!id) return;

    const categoryObj = this.productState.categories().find(c => c.id === this.editProductCategory());

    this.productState.updateProduct(id, {
      name: this.editProductName(),
      categoryId: this.editProductCategory(),
      categoryName: categoryObj?.name,
      basePrice: this.editProductBasePrice(),
      originalPrice: this.editProductOriginalPrice(),
      thumbnailUrl: this.editProductThumbnail(),
      description: this.editProductDescription(),
      inStock: this.editProductInStock()
    });

    this.closeEditProductModal();
    this.showMessage('Đã cập nhật thông tin sản phẩm thành công!');
  }

  deleteProduct(product: Product): void {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" khỏi hệ thống?`)) {
      this.productState.deleteProduct(product.id);
      this.showMessage(`Đã xóa sản phẩm: "${product.name}"`);
    }
  }

  toggleStock(product: Product): void {
    this.productState.toggleStock(product.id);
    const newStatus = !product.inStock ? 'Còn hàng' : 'Hết hàng';
    this.showMessage(`Đã chuyển trạng thái sản phẩm "${product.name}" sang: ${newStatus}`);
  }

  adjustVariantStock(productId: string, variantId: string, currentStock: number, delta: number): void {
    const next = Math.max(0, currentStock + delta);
    this.productState.updateVariantStock(productId, variantId, next);
  }

  // --- Category Operations ---

  saveNewCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }

    const slug = this.newCategorySlug().trim() || name.toLowerCase().replace(/\s+/g, '-');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      gender: this.newCategoryGender(),
      imageUrl: this.newCategoryImageUrl(),
      itemCount: 0
    };

    this.productState.addCategory(newCat);
    this.isAddCategoryOpen.set(false);
    this.newCategoryName.set('');
    this.showMessage(`Đã thêm danh mục mới: "${name}"!`);
  }

  deleteCategory(cat: Category): void {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
      this.productState.deleteCategory(cat.id);
      this.showMessage(`Đã xóa danh mục: "${cat.name}"`);
    }
  }

  // --- Order Operations ---

  updateOrderStatus(orderId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as AdminOrder['status'];
    this.productState.updateOrderStatus(orderId, newStatus);
    this.showMessage(`Đã cập nhật trạng thái đơn hàng sang "${newStatus}"!`);
  }

  viewOrderDetail(order: AdminOrder): void {
    this.selectedOrder.set(order);
  }

  closeOrderDetail(): void {
    this.selectedOrder.set(null);
  }

  // --- User & Role Management Operations ---

  toggleUserRole(user: any): void {
    const nextRole: UserRole = user.role === 'admin' ? 'customer' : 'admin';
    const roleText = nextRole === 'admin' ? 'Quản Trị Viên (Admin)' : 'Người Xem (Customer)';
    if (confirm(`Chuyển vai trò của tài khoản "${user.fullName || user.email}" thành ${roleText}?`)) {
      this.authService.updateUserRole(user.id, nextRole);
      this.showMessage(`Đã đổi vai trò của "${user.email}" thành "${nextRole.toUpperCase()}"!`);
    }
  }

  toggleUserStatus(user: any): void {
    this.authService.toggleUserStatus(user.id);
    const text = user.status === 'suspended' ? 'kích hoạt lại' : 'tạm khóa';
    this.showMessage(`Đã ${text} tài khoản "${user.email}"!`);
  }

  saveNewUser(): void {
    if (!this.newUserEmail().trim()) return;
    this.authService.addNewUser({
      fullName: this.newUserName() || 'Thành Viên Mới',
      email: this.newUserEmail(),
      role: this.newUserRole()
    });
    this.isAddUserOpen.set(false);
    this.newUserName.set('');
    this.newUserEmail.set('');
    this.showMessage('Đã tạo và phân quyền tài khoản người dùng mới thành công!');
  }

  // --- Role Switch Simulator (For Demo & Testing) ---

  simulateSwitchToCustomer(): void {
    this.authService.switchRole('customer');
    this.showMessage('Đã chuyển sang vai trò Người Xem (Customer)! Đang kiểm tra rào cản truy cập...');
    setTimeout(() => {
      this.router.navigate(['/access-denied']);
    }, 800);
  }

  simulateLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  private showMessage(msg: string): void {
    this.adminMessage.set(msg);
    setTimeout(() => {
      this.adminMessage.set(null);
    }, 3500);
  }
}
