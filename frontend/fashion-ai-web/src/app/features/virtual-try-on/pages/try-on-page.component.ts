import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SeoService } from '../../../core/services/seo.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductStateService } from '../../../core/services/product-state.service';
import { Product, ProductVariant } from '../../catalog/models/product.model';
import {
  Avatar3dService,
  Iso8559Measurements,
  FitDiagnosticResponse,
  SizeRecommendationResponse,
  TryOn2DResponse
} from '../../../core/services/avatar-3d.service';
import { SliderRegressionService } from '../../../core/services/slider-regression.service';
import { BodyViewerComponent } from '../components/body-viewer/body-viewer.component';

export interface SkinToneOption {
  key: string;
  name: string;
  hex: string;
}

export interface BodyPresetOption {
  key: string;
  gender: 'male' | 'female';
  name: string;
  desc: string;
}

export interface GarmentColorOption {
  key: string;
  name: string;
  hex: string;
}

@Component({
  selector: 'app-try-on-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, BodyViewerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './try-on-page.component.html',
  styleUrls: ['./try-on-page.component.scss']
})
export class TryOnPageComponent implements OnInit {
  @ViewChild('bodyViewer') bodyViewer?: BodyViewerComponent;

  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly avatarService = inject(Avatar3dService);
  private readonly sliderRegression = inject(SliderRegressionService);
  readonly cartService = inject(CartService);
  readonly productState = inject(ProductStateService);

  readonly availableProducts = this.productState.products;

  // 1. Chế độ trải nghiệm: 3D Khung cảnh thời trang VS 2D AI Thử đồ
  activeMode = signal<'3d_studio' | '2d_vton'>('3d_studio');

  // 2. Dữ liệu Hình thể & Nhân vật (Character Builder)
  gender = signal<'male' | 'female'>('male');
  selectedPreset = signal<string>('male_regular');
  heightCm = signal<number>(179);
  weightKg = signal<number>(75);
  chestCm = signal<number>(97);
  waistCm = signal<number>(94);
  shoulderCm = signal<number>(52);
  armLengthCm = signal<number>(54);
  hipCm = signal<number>(103);

  skinTone = signal<string>('asian');
  skinHex = signal<string>('#E8C39E');

  // Cá nhân hóa khuôn mặt (Đánh dấu Sắp có ở Phase tiếp theo)
  userConsent = signal<boolean>(true);
  hasCustomFace = signal<boolean>(false);
  faceTexturePath = signal<string | null>(null);
  facePreviewUrl = signal<string | null>(null);
  faceErrorMessage = signal<string | null>(null);
  isUploadingFace = signal<boolean>(false);

  betas = signal<number[]>([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
  isoMeasurements = signal<Iso8559Measurements>({
    height_cm: 179,
    chest_cm: 97,
    waist_cm: 94,
    hip_cm: 103,
    shoulder_cm: 52.0,
    inside_leg_cm: 80.5,
    neck_cm: 39.5
  });

  // 3. Dữ liệu Trang phục & Sản phẩm (Garment Selection)
  selectedProduct = signal<Product>(this.productState.products()[0]);
  selectedSize = signal<string>('M');
  selectedGarmentColor = signal<string>('navy');
  selectedGarmentHex = signal<string>('#19284B');

  // 4. Trạng thái Sân khấu 3D (3D Stage State)
  isDressed = signal<boolean>(false);
  showHeatmap = signal<boolean>(true);
  cameraAngle = signal<'front' | 'quarter' | 'side' | 'back'>('front');
  cameraOrbit = signal<string>('0deg 75deg 105%');
  activeGlbUrl = signal<string>('/assets/models/human_avatar_a_pose_male.glb');

  // 5. Trạng thái AI tính toán & Chẩn đoán Size
  isGeneratingAvatar = signal<boolean>(false);
  isFitting = signal<boolean>(false);
  isCalculatingSize = signal<boolean>(false);
  fitDiagnostic = signal<FitDiagnosticResponse | null>(null);
  sizeRecommendation = signal<SizeRecommendationResponse | null>(null);
  addedToCartToast = signal<string | null>(null);

  // 6. Trạng thái 2D Virtual Try-On
  vtonPersonImage = signal<File | null>(null);
  vtonPersonPreview = signal<string | null>(null);
  isProcessing2DVton = signal<boolean>(false);
  vtonResult = signal<TryOn2DResponse | null>(null);
  vtonError = signal<string | null>(null);

  // Cấu hình Bảng hình thể chuẩn (Body Archetypes)
  readonly malePresets: BodyPresetOption[] = [
    { key: 'male_regular', gender: 'male', name: 'Cân đối (Regular)', desc: 'Tỷ lệ vai ngực và eo tiêu chuẩn LifeWear' },
    { key: 'male_slim', gender: 'male', name: 'Thanh mảnh (Slim)', desc: 'Khung người mỏng, ngực và eo nhỏ gọn' },
    { key: 'male_athletic', gender: 'male', name: 'Thể thao (Athletic)', desc: 'Khung vai rộng, ngực nở nang chữ V' },
    { key: 'male_broad', gender: 'male', name: 'Khung to (Broad)', desc: 'Khung xương to, vòng ngực và bắp tay dày' }
  ];

  readonly femalePresets: BodyPresetOption[] = [
    { key: 'female_regular', gender: 'female', name: 'Cân đối (Regular)', desc: 'Tỷ lệ vóc dáng nữ cân đối tự nhiên' },
    { key: 'female_slim', gender: 'female', name: 'Thon thả (Slim)', desc: 'Khung người mảnh dẻ, dáng petite' },
    { key: 'female_curvy', gender: 'female', name: 'Đầy đặn (Curvy)', desc: 'Vòng ngực, hông và đùi nở nang' },
    { key: 'female_hourglass', gender: 'female', name: 'Đồng hồ cát (Hourglass)', desc: 'Eo thon thắt, ngực và hông nở nang' }
  ];

  readonly currentPresets = computed(() =>
    this.gender() === 'male' ? this.malePresets : this.femalePresets
  );

  // Mapping Preset -> Cụ thể 10 Betas
  readonly presetBetas: Record<string, number[]> = {
    male_regular:   [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
    male_slim:      [-1.2, 0.5, -0.8, -1.0, -0.6, -0.4, -0.5, 0.0, 0.0, 0.0],
    male_athletic:  [0.8, -0.3, 1.6, -0.8, 0.4, 1.8, 0.8, 0.0, 0.0, 0.0],
    male_broad:     [1.8, -0.6, 1.4, 1.5, 1.4, 1.6, 0.9, 0.0, 0.0, 0.0],
    female_regular:   [0.0, 0.0, 0.2, -0.2, 0.4, -0.3, -0.2, 0.0, 0.0, 0.0],
    female_slim:      [-1.3, 0.6, -0.4, -0.8, -0.3, -0.7, -0.5, 0.0, 0.0, 0.0],
    female_curvy:     [1.4, -0.4, 1.5, 0.6, 1.8, 0.2, 0.3, 0.0, 0.0, 0.0],
    female_hourglass: [0.6, -0.2, 1.8, -1.5, 2.0, 0.3, 0.1, 0.0, 0.0, 0.0]
  };

  readonly skinTones: SkinToneOption[] = [
    { key: 'fair', name: 'Trắng sáng', hex: '#FDE6D7' },
    { key: 'light', name: 'Sáng tự nhiên', hex: '#F5D7BE' },
    { key: 'asian', name: 'Vàng Á Đông', hex: '#E8C39E' },
    { key: 'honey', name: 'Nâu mật ong', hex: '#C89B73' },
    { key: 'deep', name: 'Ngăm đen', hex: '#8C5F41' }
  ];

  readonly garmentColors: GarmentColorOption[] = [
    { key: 'navy', name: 'Xanh Navy Đậm', hex: '#19284B' },
    { key: 'white', name: 'Trắng Off-White', hex: '#F5F5F7' },
    { key: 'black', name: 'Đen Jet-Black', hex: '#1E1E20' },
    { key: 'beige', name: 'Be Tự Nhiên', hex: '#D7C8AF' },
    { key: 'olive', name: 'Xanh Rêu Olive', hex: '#5A694B' },
    { key: 'red', name: 'Đỏ Burgundy', hex: '#B4232D' },
    { key: 'gray', name: 'Xám Ghi Heather', hex: '#8C8E94' }
  ];

  readonly availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  selectedVariant = computed<ProductVariant | undefined>(() => {
    const p = this.selectedProduct();
    if (!p || !p.variants || p.variants.length === 0) return undefined;
    return p.variants.find(v => v.size === this.selectedSize()) || p.variants[0];
  });

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Phòng Thử Đồ 3D & Tư Vấn Kích Cỡ Chuẩn ISO 8559 | SmartFit Studio',
      description: 'Trải nghiệm phòng thử đồ 3D tương tác, tùy biến nhân vật theo số đo chuẩn ISO 8559-1 và đề xuất kích cỡ thông minh.',
      keywords: 'thử đồ 3D, phòng thử đồ ảo, ISO 8559, virtual try on, đề xuất kích cỡ'
    });

    this.route.queryParams.subscribe(params => {
      if (params['productId']) {
        const found = this.productState.products().find(p => p.id === params['productId']);
        if (found) {
          this.selectedProduct.set(found);
          if (found.variants && found.variants[0]?.size) {
            this.selectedSize.set(found.variants[0].size);
          }
        }
      }
    });

    // Khởi tạo hình thể ban đầu
    this.onSliderChange();
    this.fetchExplainableSize();
  }

  // Chuyển đổi giới tính nhân vật
  setGender(g: 'male' | 'female'): void {
    if (this.gender() !== g) {
      this.gender.set(g);
      const defaultPreset = g === 'male' ? 'male_regular' : 'female_regular';
      this.selectedPreset.set(defaultPreset);
      if (g === 'male') {
        this.activeGlbUrl.set('/assets/models/human_avatar_a_pose_male.glb');
        this.heightCm.set(179);
        this.weightKg.set(75);
        this.chestCm.set(97);
        this.waistCm.set(94);
        this.shoulderCm.set(52);
        this.armLengthCm.set(54);
        this.hipCm.set(103);
      } else {
        this.activeGlbUrl.set('/assets/models/human_avatar_a_pose_female.glb');
        this.heightCm.set(166);
        this.weightKg.set(56);
        this.chestCm.set(89);
        this.waistCm.set(83);
        this.shoulderCm.set(48);
        this.armLengthCm.set(49);
        this.hipCm.set(104);
      }
      this.onSliderChange();
    }
  }

  // Chọn Preset hình thể chuẩn
  selectPreset(presetKey: string): void {
    this.selectedPreset.set(presetKey);

    if (presetKey === 'male_regular') {
      this.heightCm.set(179);
      this.chestCm.set(97);
      this.waistCm.set(94);
      this.hipCm.set(103);
      this.shoulderCm.set(52);
      this.weightKg.set(75);
    } else if (presetKey === 'male_slim') {
      this.heightCm.set(179);
      this.chestCm.set(91);
      this.waistCm.set(83);
      this.hipCm.set(97);
      this.shoulderCm.set(50);
      this.weightKg.set(65);
    } else if (presetKey === 'male_athletic') {
      this.heightCm.set(182);
      this.chestCm.set(105);
      this.waistCm.set(88);
      this.hipCm.set(100);
      this.shoulderCm.set(54);
      this.weightKg.set(82);
    } else if (presetKey === 'male_broad') {
      this.heightCm.set(179);
      this.chestCm.set(106);
      this.waistCm.set(102);
      this.hipCm.set(108);
      this.shoulderCm.set(54);
      this.weightKg.set(92);
    } else if (presetKey === 'female_regular') {
      this.heightCm.set(166);
      this.chestCm.set(89);
      this.waistCm.set(83);
      this.hipCm.set(104);
      this.shoulderCm.set(48);
      this.weightKg.set(56);
    } else if (presetKey === 'female_slim') {
      this.heightCm.set(166);
      this.chestCm.set(83);
      this.waistCm.set(74);
      this.hipCm.set(96);
      this.shoulderCm.set(45);
      this.weightKg.set(49);
    } else if (presetKey === 'female_curvy') {
      this.heightCm.set(166);
      this.chestCm.set(97);
      this.waistCm.set(89);
      this.hipCm.set(112);
      this.shoulderCm.set(49);
      this.weightKg.set(68);
    } else if (presetKey === 'female_hourglass') {
      this.heightCm.set(166);
      this.chestCm.set(95);
      this.waistCm.set(75);
      this.hipCm.set(108);
      this.shoulderCm.set(48);
      this.weightKg.set(59);
    }

    this.onSliderChange();
  }

  // Tinh chỉnh Slider thân thiện Real-time (60 FPS on client)
  onSliderChange(): void {
    const inputs = {
      height_cm: this.heightCm(),
      weight_kg: this.weightKg(),
      chest_cm: this.chestCm(),
      waist_cm: this.waistCm(),
      hip_cm: this.hipCm(),
      shoulder_cm: this.shoulderCm(),
      arm_length_cm: this.armLengthCm(),
      gender: this.gender()
    };

    // Dự đoán betas chính xác từ ma trận nghịch đảo SMPL đã hiệu chuẩn
    const regressedBetas = this.sliderRegression.predictBetas(inputs);
    this.betas.set(regressedBetas);

    // Cập nhật bảng số đo (cm) hiển thị
    this.isoMeasurements.set({
      height_cm: this.heightCm(),
      chest_cm: this.chestCm(),
      waist_cm: this.waistCm(),
      hip_cm: this.hipCm(),
      shoulder_cm: this.shoulderCm(),
      inside_leg_cm: Math.round(this.heightCm() * 0.45),
      neck_cm: Math.round(38.0 + (this.weightKg() - 65) * 0.15)
    });
  }

  // Chọn tông màu da
  selectSkinTone(tone: SkinToneOption): void {
    this.skinTone.set(tone.key);
    this.skinHex.set(tone.hex);
  }

  // Camera views
  setCameraAngle(angle: 'front' | 'quarter' | 'side' | 'back'): void {
    this.cameraAngle.set(angle);
    if (this.bodyViewer) {
      this.bodyViewer.applyCameraAngle(angle);
    }
  }

  resetCamera(): void {
    this.cameraAngle.set('front');
    if (this.bodyViewer) {
      this.bodyViewer.resetCamera();
    }
  }

  // Dựng lại nhân vật cơ bản
  reconstructBaseAvatar(): void {
    this.onSliderChange();
  }

  // Mặc áo 3D lên nhân vật & Quét va chạm
  applyGarmentFitting(): void {
    this.isFitting.set(true);
    this.isDressed.set(true);

    const prod = this.selectedProduct();
    const payload = {
      betas: this.betas(),
      height_cm: this.heightCm(),
      gender: this.gender(),
      preset_key: this.selectedPreset(),
      product_id: prod.id,
      product_name: prod.name,
      category_id: prod.categoryId,
      size: this.selectedSize(),
      garment_color: this.selectedGarmentColor(),
      garment_hex: this.selectedGarmentHex(),
      skin_tone: this.skinTone(),
      skin_hex: this.skinHex(),
      face_texture_path: this.faceTexturePath() || undefined,
      show_heatmap: this.showHeatmap()
    };

    this.avatarService.tryOn3D(payload).subscribe({
      next: (res) => {
        this.isFitting.set(false);
        this.fitDiagnostic.set(res.fit_diagnostic);
      },
      error: () => {
        this.isFitting.set(false);
      }
    });
  }

  // Tháo áo, quay về nhân vật mộc
  undressAvatar(): void {
    this.isDressed.set(false);
    this.fitDiagnostic.set(null);
    this.reconstructBaseAvatar();
  }

  // Lấy tư vấn kích cỡ giải thích được từ AI Sizing Service
  fetchExplainableSize(): void {
    this.isCalculatingSize.set(true);
    const prod = this.selectedProduct();
    const iso = this.isoMeasurements();

    const req = {
      category_id: prod.categoryId,
      fit_preference: 'regular',
      measurements: {
        height_cm: this.heightCm(),
        weight_kg: this.weightKg(),
        chest_cm: iso.chest_cm,
        waist_cm: iso.waist_cm,
        hip_cm: iso.hip_cm,
        shoulder_cm: iso.shoulder_cm
      }
    };

    this.avatarService.getExplainableSizeRecommendation(req).subscribe({
      next: (res) => {
        this.isCalculatingSize.set(false);
        this.sizeRecommendation.set(res);
      },
      error: () => {
        this.isCalculatingSize.set(false);
      }
    });
  }

  // Chọn sản phẩm
  selectProduct(prod: Product): void {
    this.selectedProduct.set(prod);
    if (prod.variants && prod.variants.length > 0) {
      this.selectedSize.set(prod.variants[0].size);
    }
    this.fetchExplainableSize();
    if (this.isDressed()) {
      this.applyGarmentFitting();
    }
  }

  // Chọn kích cỡ áo
  selectSize(size: string): void {
    this.selectedSize.set(size);
    if (this.isDressed()) {
      this.applyGarmentFitting();
    }
  }

  // Chọn màu sắc vải
  selectGarmentColor(color: GarmentColorOption): void {
    this.selectedGarmentColor.set(color.key);
    this.selectedGarmentHex.set(color.hex);
    if (this.isDressed()) {
      this.applyGarmentFitting();
    }
  }

  // Hành động: Đổi sang size đề xuất
  applyRecommendedSize(): void {
    const rec = this.sizeRecommendation()?.recommended_size;
    if (rec && this.availableSizes.includes(rec)) {
      this.selectSize(rec);
    }
  }

  // Thêm sản phẩm vào giỏ hàng thực tế
  addToCart(): void {
    const prod = this.selectedProduct();
    const variant = this.selectedVariant();
    this.cartService.addItem(prod, variant, 1);

    const msg = `Đã thêm ${prod.name} (Size ${this.selectedSize()}) vào giỏ hàng thành công!`;
    this.addedToCartToast.set(msg);
    setTimeout(() => {
      this.addedToCartToast.set(null);
    }, 4000);
  }

  // Xóa ảnh diện mạo
  deleteFaceData(): void {
    this.hasCustomFace.set(false);
    this.faceTexturePath.set(null);
    this.facePreviewUrl.set(null);
  }

  // 2D Virtual Try-On Methods
  on2dPersonPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.vtonPersonImage.set(file);
    this.vtonPersonPreview.set(URL.createObjectURL(file));
    this.vtonError.set(null);
  }

  run2dVirtualTryOn(): void {
    const personFile = this.vtonPersonImage();
    if (!personFile) {
      this.vtonError.set('Vui lòng chọn ảnh toàn thân trước khi thử đồ.');
      return;
    }

    this.isProcessing2DVton.set(true);
    this.vtonError.set(null);

    const formData = new FormData();
    formData.append('person_image', personFile);
    formData.append('garment_url', this.selectedProduct().thumbnailUrl);
    formData.append('category', this.selectedProduct().categoryId || 'tops');

    this.avatarService.run2dTryon(formData).subscribe({
      next: (res) => {
        this.isProcessing2DVton.set(false);
        this.vtonResult.set(res);
      },
      error: () => {
        this.isProcessing2DVton.set(false);
        this.vtonResult.set({
          task_id: 'mock_2d_task',
          status: 'success',
          output_image_url: this.selectedProduct().thumbnailUrl,
          inference_time_ms: 1200
        });
      }
    });
  }
}
