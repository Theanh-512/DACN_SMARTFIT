import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  CUSTOM_ELEMENTS_SCHEMA
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
  imports: [CommonModule, RouterLink, FormsModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './try-on-page.component.html',
  styleUrls: ['./try-on-page.component.scss']
})
export class TryOnPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly avatarService = inject(Avatar3dService);
  readonly cartService = inject(CartService);
  readonly productState = inject(ProductStateService);

  readonly availableProducts = this.productState.products;

  // 1. Chế độ trải nghiệm: 3D Khung cảnh thời trang VS 2D AI Thử đồ
  activeMode = signal<'3d_studio' | '2d_vton'>('3d_studio');

  // 2. Dữ liệu Hình thể & Nhân vật (Character Builder)
  gender = signal<'male' | 'female'>('male');
  selectedPreset = signal<string>('male_regular');
  heightCm = signal<number>(175);
  weightKg = signal<number>(70);
  skinTone = signal<string>('asian');
  skinHex = signal<string>('#E8C39E');

  // Cá nhân hóa khuôn mặt & Quyền riêng tư (Face Personalization & Privacy)
  userConsent = signal<boolean>(true);
  hasCustomFace = signal<boolean>(false);
  faceTexturePath = signal<string | null>(null);
  facePreviewUrl = signal<string | null>(null);
  faceErrorMessage = signal<string | null>(null);
  isUploadingFace = signal<boolean>(false);

  betas = signal<number[]>([0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0]);
  isoMeasurements = signal<Iso8559Measurements>({
    height_cm: 175,
    chest_cm: 96,
    waist_cm: 80,
    hip_cm: 98,
    shoulder_cm: 44.0,
    inside_leg_cm: 78.5,
    neck_cm: 38.5
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
  activeGlbUrl = signal<string>('/assets/models/base_avatar.glb');

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

  // Biến thể đang được chọn từ sản phẩm
  selectedVariant = computed<ProductVariant | undefined>(() => {
    const p = this.selectedProduct();
    if (!p || !p.variants || p.variants.length === 0) return undefined;
    return p.variants.find(v => v.size === this.selectedSize()) || p.variants[0];
  });

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Phòng Thử Đồ 3D & Tư Vấn Kích Cỡ Chuẩn ISO 8559 | SmartFit Studio',
      description: 'Trải nghiệm phòng thử đồ 3D tương tác, tùy biến nhân vật theo số đo chuẩn ISO 8559-1, nhận diện khuôn mặt cá nhân và đánh giá độ vừa vặn trang phục thông minh.',
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

    // Khởi tạo nhân vật ban đầu
    this.reconstructBaseAvatar();
    this.fetchExplainableSize();
  }

  // Chuyển đổi giới tính nhân vật
  setGender(g: 'male' | 'female'): void {
    if (this.gender() !== g) {
      this.gender.set(g);
      const defaultPreset = g === 'male' ? 'male_regular' : 'female_regular';
      this.selectedPreset.set(defaultPreset);
      this.heightCm.set(g === 'male' ? 175 : 162);
      this.weightKg.set(g === 'male' ? 70 : 52);
      this.reconstructBaseAvatar();
    }
  }

  // Chọn Preset hình thể chuẩn
  selectPreset(presetKey: string): void {
    this.selectedPreset.set(presetKey);
    this.reconstructBaseAvatar();
  }

  // Chọn tông màu da
  selectSkinTone(tone: SkinToneOption): void {
    this.skinTone.set(tone.key);
    this.skinHex.set(tone.hex);
    this.reconstructBaseAvatar();
  }

  // Tải ảnh chân dung cá nhân & Quét khuôn mặt (Face Personalization)
  onFacePhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.faceErrorMessage.set(null);

    // Kiểm tra định dạng tệp (Chỉ chấp nhận JPEG, PNG)
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      this.faceErrorMessage.set('Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh định dạng JPG hoặc PNG.');
      return;
    }

    // Kiểm tra dung lượng tệp (Tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.faceErrorMessage.set('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    // Kiểm tra sự đồng thuận về quyền riêng tư
    if (!this.userConsent()) {
      this.faceErrorMessage.set('Vui lòng tích chọn đồng ý xử lý ảnh để tiếp tục.');
      return;
    }

    this.isUploadingFace.set(true);
    const previewUrl = URL.createObjectURL(file);
    this.facePreviewUrl.set(previewUrl);

    const formData = new FormData();
    formData.append('person_image', file);
    formData.append('height_cm', this.heightCm().toString());
    formData.append('weight_kg', this.weightKg().toString());
    formData.append('gender', this.gender());
    formData.append('preset_key', this.selectedPreset());
    formData.append('user_consent', 'true');

    this.avatarService.uploadPhotoReconstruct(formData).subscribe({
      next: (res) => {
        this.isUploadingFace.set(false);
        this.hasCustomFace.set(true);
        if (res.face_texture_relative_path) {
          this.faceTexturePath.set(res.face_texture_relative_path);
        }
        if (res.skin_hex) {
          this.skinHex.set(res.skin_hex);
        }
        if (res.glb_url) {
          this.activeGlbUrl.set(res.glb_url);
        }
        if (res.betas) this.betas.set(res.betas);
        if (res.iso_measurements) this.isoMeasurements.set(res.iso_measurements);

        if (this.isDressed()) {
          this.applyGarmentFitting();
        }
      },
      error: (err) => {
        this.isUploadingFace.set(false);
        const errMsg = err?.error?.detail || 'Không thể quét khuôn mặt từ ảnh. Hãy thử ảnh chụp chính diện rõ nét hơn.';
        this.faceErrorMessage.set(errMsg);
      }
    });
  }

  // Xóa dữ liệu diện mạo (Quyền được lãng quên - Privacy)
  deleteFaceData(): void {
    const path = this.faceTexturePath();
    this.hasCustomFace.set(false);
    this.faceTexturePath.set(null);
    this.facePreviewUrl.set(null);
    this.faceErrorMessage.set(null);

    this.avatarService.deleteAvatarData(path || undefined).subscribe();
    this.reconstructBaseAvatar();
  }

  // Dựng lại nhân vật cơ bản (3D Reconstruct)
  reconstructBaseAvatar(): void {
    this.isGeneratingAvatar.set(true);

    const payload = {
      height_cm: this.heightCm(),
      weight_kg: this.weightKg(),
      gender: this.gender(),
      preset_key: this.selectedPreset(),
      body_type: 'regular',
      skin_tone: this.skinTone(),
      skin_hex: this.skinHex(),
      face_texture_path: this.faceTexturePath() || undefined
    };

    this.avatarService.reconstructAvatar(payload).subscribe({
      next: (res) => {
        this.isGeneratingAvatar.set(false);
        this.betas.set(res.betas);
        this.isoMeasurements.set(res.iso_measurements);
        if (res.glb_url) {
          this.activeGlbUrl.set(res.glb_url);
        }
        this.fetchExplainableSize();

        if (this.isDressed()) {
          this.applyGarmentFitting();
        }
      },
      error: () => {
        this.isGeneratingAvatar.set(false);
        this.activeGlbUrl.set('/assets/models/base_avatar.glb');
      }
    });
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
        if (res.scene_glb_url) {
          this.activeGlbUrl.set(res.scene_glb_url);
        }
      },
      error: () => {
        this.isFitting.set(false);
        this.activeGlbUrl.set('/assets/models/tryon_perfect.glb');
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

  // Đổi góc nhìn camera 3D
  setCameraAngle(angle: 'front' | 'quarter' | 'side' | 'back'): void {
    this.cameraAngle.set(angle);
    switch (angle) {
      case 'front':
        this.cameraOrbit.set('0deg 75deg 105%');
        break;
      case 'quarter':
        this.cameraOrbit.set('45deg 75deg 105%');
        break;
      case 'side':
        this.cameraOrbit.set('90deg 75deg 105%');
        break;
      case 'back':
        this.cameraOrbit.set('180deg 75deg 105%');
        break;
    }
  }

  // Đặt lại góc nhìn mặc định
  resetCamera(): void {
    this.setCameraAngle('front');
  }

  // Xử lý chế độ 2D AI Try-On
  on2dPersonPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.vtonPersonImage.set(file);
      this.vtonPersonPreview.set(URL.createObjectURL(file));
      this.vtonError.set(null);
    }
  }

  run2dVirtualTryOn(): void {
    const personFile = this.vtonPersonImage();
    if (!personFile) {
      this.vtonError.set('Vui lòng tải lên ảnh toàn thân của bạn để thử đồ 2D.');
      return;
    }

    const prod = this.selectedProduct();
    this.isProcessing2DVton.set(true);
    this.vtonError.set(null);

    const formData = new FormData();
    formData.append('person_image', personFile);
    formData.append('category', 'tops');
    formData.append('garment_url', prod.thumbnailUrl);

    this.avatarService.run2dTryon(formData).subscribe({
      next: (res) => {
        this.isProcessing2DVton.set(false);
        this.vtonResult.set(res);
      },
      error: () => {
        this.isProcessing2DVton.set(false);
        this.vtonError.set('Mô hình AI 2D (IDM-VTON) hiện đang cần GPU chuyên dụng hoặc chưa nạp checkpoint. Hệ thống tạm chuyển về chế độ 3D.');
      }
    });
  }
}
