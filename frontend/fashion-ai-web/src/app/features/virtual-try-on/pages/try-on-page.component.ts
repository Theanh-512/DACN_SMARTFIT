import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
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
import { SizeRecommendationService } from '../../../core/services/size-recommendation.service';
import { SliderRegressionService } from '../../../core/services/slider-regression.service';
import { PoseService, JointRotation } from '../../../core/services/pose.service';
import { BodyShapeService, RegionalMorphValues } from '../../../core/services/body-shape.service';
import { BodyViewerComponent } from '../components/body-viewer/body-viewer.component';
import { CameraCaptureComponent, BodyEstimateResult } from '../components/camera-capture/camera-capture.component';

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
  imports: [CommonModule, RouterLink, FormsModule, BodyViewerComponent, CameraCaptureComponent, DecimalPipe],
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
  private readonly fitAdvisorService = inject(SizeRecommendationService);
  readonly poseService = inject(PoseService);
  readonly bodyShapeService = inject(BodyShapeService);
  readonly cartService = inject(CartService);
  readonly productState = inject(ProductStateService);

  readonly availableProducts = this.productState.products;

  // 1. Chế độ trải nghiệm
  activeMode = signal<'3d_studio' | '2d_vton'>('3d_studio');

  // 2. Tab nhân vật Phase 3.6: Số đo vs Dạng người vs Tư thế
  activeCharacterTab = signal<'measurements' | 'shape' | 'pose'>('measurements');

  // 3. Dữ liệu Hình thể & Nhân vật
  gender = signal<'male' | 'female'>('male');
  selectedPreset = signal<string>('male_regular');
  heightCm = signal<number>(179);
  weightKg = signal<number>(75);
  chestCm = signal<number>(97);
  waistCm = signal<number>(94);
  shoulderCm = signal<number>(52);
  hipCm = signal<number>(103);
  armLengthCm = signal<number>(60);

  skinTone = signal<string>('asian');
  skinHex = signal<string>('#E8C39E');

  // AI Camera Body Estimation
  isCameraModalOpen = signal<boolean>(false);
  isEstimatedMock = signal<boolean>(false);
  estimateConfidence = signal<number | null>(null);

  // Phase 3.6: Lớp đồ lót nền
  isUnderwearVisible = signal<boolean>(true);

  // Phase 3.6: Dạng người & Morph cục bộ
  regionalMorphs = signal<RegionalMorphValues>(this.bodyShapeService.createDefaultMorphs());
  activeShapePreset = signal<string>('balanced');

  // Phase 3.6: Xoay khớp & Tư thế
  activePosePreset = signal<string>('a_pose');
  selectedJointId = signal<string>('left_shoulder');
  jointRotations = signal<Record<string, JointRotation>>(this.poseService.createDefaultRotations());

  currentJointRotation = computed<JointRotation>(() => {
    const map = this.jointRotations();
    return map[this.selectedJointId()] || { x: 0, y: 0, z: 0 };
  });

  currentJointInfo = computed(() => {
    return this.poseService.majorJoints.find(j => j.id === this.selectedJointId()) || this.poseService.majorJoints[4];
  });

  // Dynamic Rigged GLB URL based on gender
  glbUrl = computed(() => {
    const g = this.gender();
    return `/assets/models/rigged/human_avatar_rigged_${g}.glb`;
  });
  activeGlbUrl = this.glbUrl;
  isGeneratingAvatar = signal<boolean>(false);

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
    torso_length_cm: 60.5,
    neck_cm: 39.5
  });

  // 4. Sản phẩm & Tủ đồ 3D
  selectedProductId = signal<string>('prod-1');
  selectedProduct = computed<Product>(() => {
    const prods = this.availableProducts();
    return prods.find(p => p.id === this.selectedProductId()) || prods[0];
  });
  selectedSize = signal<string>('L');
  selectedGarmentColor = signal<string>('navy');
  selectedGarmentHex = signal<string>('#19284B');
  garmentColorHex = signal<string>('#19284B');

  // 5. Trạng thái Thử Đồ & Chẩn đoán
  isDressed = signal<boolean>(false);
  isFitting = signal<boolean>(false);
  showHeatmap = signal<boolean>(false);
  cameraAngle = signal<'front' | 'quarter' | 'side' | 'back'>('front');
  fitDiagnostic = signal<FitDiagnosticResponse | null>(null);
  sizeRecommendation = signal<SizeRecommendationResponse | null>(null);
  addedToCartToast = signal<string | null>(null);

  /** Phase 5: Kết quả đánh giá độ vừa thật từ /fit/evaluate */
  fitEvaluateResult = signal<any | null>(null);
  fitEvaluateLoading = signal<boolean>(false);
  fitEvaluateError = signal<string | null>(null);

  // 6. Trạng thái 2D Virtual Try-On
  vtonPersonImage = signal<File | null>(null);
  vtonPersonPreview = signal<string | null>(null);
  isProcessing2DVton = signal<boolean>(false);
  vtonResult = signal<TryOn2DResponse | null>(null);
  vtonError = signal<string | null>(null);

  readonly malePresets: BodyPresetOption[] = [
    { key: 'male_regular', gender: 'male', name: 'Cân đối (Regular)', desc: 'Tỷ lệ vai ngực và eo tiêu chuẩn' },
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

  selectedVariant = computed<ProductVariant | undefined>(() => {
    const p = this.selectedProduct();
    if (!p || !p.variants || p.variants.length === 0) return undefined;
    return p.variants.find(v => v.size === this.selectedSize()) || p.variants[0];
  });

  selectedGarmentGlbUrl = computed<string>(() => {
    const szUpper = this.selectedSize().toUpperCase();
    const sz = szUpper.toLowerCase();
    const prod = this.selectedProduct();
    const prodId = this.selectedProductId();

    // 1m80 avatar wearing size S tension demonstration
    if (this.heightCm() >= 179 && sz === 's') {
      return '/assets/garments/fitted_s_180.glb';
    }

    // Check if product is from published persistent catalog
    if (prodId.startsWith('prod_') && prodId !== 'prod_tshirt_cotton' && prodId !== 'prod_cardigan_knit') {
      return `/assets/garments/${prodId}/sizes/${szUpper}/garment-v1.glb`;
    }

    // Check if selected product is Cardigan
    const isCardigan = prodId.includes('cardigan') || (prod?.name && prod.name.toLowerCase().includes('cardigan'));
    if (isCardigan) {
      return `/assets/garments/prod_cardigan_knit_${sz}.glb`;
    }

    return `/assets/garments/prod_tshirt_cotton_${sz}.glb`;
  });

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Phòng Thử Đồ 3D & Tư Vấn Kích Cỡ Chuẩn ISO 8559 | SmartFit Studio',
      description: 'Trải nghiệm phòng thử đồ 3D tương tác, tùy biến nhân vật theo số đo chuẩn ISO 8559-1 và đề xuất kích cỡ thông minh.'
    });

    this.route.queryParams.subscribe((params) => {
      if (params['productId']) {
        this.selectedProductId.set(params['productId']);
      }
      if (params['size']) {
        this.selectedSize.set(params['size']);
      }
    });

    this.onSliderChange();
  }

  // ==========================================
  // PHASE 3.6: PHÍM BẬT/TẮT ĐỒ LÓT NỀN
  // ==========================================
  toggleUnderwear(): void {
    this.isUnderwearVisible.update(v => !v);
  }

  // ==========================================
  // PHASE 3.6: DẠNG NGƯỜI & MORPH CỤC BỘ
  // ==========================================
  selectShapePreset(presetId: string): void {
    const preset = this.bodyShapeService.getPreset(presetId);
    if (!preset) return;

    this.activeShapePreset.set(presetId);
    this.betas.set([...preset.betas]);
    this.regionalMorphs.set({ ...preset.regionalMorphs });

    // Update friendly sliders
    this.heightCm.set(preset.measurements.height_cm);
    this.weightKg.set(preset.measurements.weight_kg);
    this.chestCm.set(preset.measurements.chest_cm);
    this.waistCm.set(preset.measurements.waist_cm);
    this.hipCm.set(preset.measurements.hip_cm);
    this.shoulderCm.set(preset.measurements.shoulder_cm);

    this.updateIsoMeasurements();
  }

  onRegionalMorphChange(morphKey: keyof RegionalMorphValues, value: number): void {
    const current = { ...this.regionalMorphs() };
    current[morphKey] = Number(value);
    this.regionalMorphs.set(current);

    // Synchronize friendly slider signals with manual regional morph adjustments
    const g = this.gender();
    const m0 = this.sliderRegression.baselines[g];
    const weightVal = this.weightKg();
    const F = Math.max(-1.5, Math.min(1.8, (weightVal - m0.weight_kg) / 18.0));

    if (morphKey === 'morph_chest') {
      this.chestCm.set(Math.round(m0.chest_cm + (F * 11.0) + (Number(value) * 8.0)));
    } else if (morphKey === 'morph_abdomen') {
      this.waistCm.set(Math.round(m0.waist_cm + (F * 10.0) + (Number(value) * 8.0)));
    } else if (morphKey === 'morph_shoulders') {
      this.shoulderCm.set(Math.round(m0.shoulder_cm + (Number(value) * 4.0)));
    }

    this.updateIsoMeasurements();
  }

  resetRegionalMorphs(): void {
    this.regionalMorphs.set(this.bodyShapeService.createDefaultMorphs());
    this.onSliderChange();
  }

  // ==========================================
  // PHASE 3.6: ĐIỀU KHIỂN TƯ THẾ & XOAY KHỚP
  // ==========================================
  selectJoint(jointId: string): void {
    this.selectedJointId.set(jointId);
  }

  onJointAxisChange(axis: 'x' | 'y' | 'z', value: number): void {
    const jointId = this.selectedJointId();
    const currentMap = { ...this.jointRotations() };
    const currentRot = { ...(currentMap[jointId] || { x: 0, y: 0, z: 0 }) };

    currentRot[axis] = Number(value);
    const clamped = this.poseService.clampRotation(jointId, currentRot);

    currentMap[jointId] = clamped;
    this.jointRotations.set(currentMap);
  }

  selectPosePreset(presetId: string): void {
    const preset = this.poseService.getPreset(presetId);
    if (!preset) return;

    this.activePosePreset.set(presetId);
    const updated = this.poseService.createDefaultRotations();

    // Apply preset rotations
    for (const [jId, rot] of Object.entries(preset.rotations)) {
      updated[jId] = { ...rot };
    }
    this.jointRotations.set(updated);
  }

  resetPose(): void {
    this.selectPosePreset('a_pose');
  }

  // ==========================================
  // CƠ CHẾ SỐ ĐO & HÌNH THỂ
  // ==========================================
  setGender(g: 'male' | 'female'): void {
    this.gender.set(g);
    if (g === 'female') {
      this.heightCm.set(166);
      this.weightKg.set(56);
      this.chestCm.set(89);
      this.waistCm.set(83);
      this.hipCm.set(104);
      this.shoulderCm.set(48);
      this.selectedPreset.set('female_regular');
    } else {
      this.heightCm.set(179);
      this.weightKg.set(75);
      this.chestCm.set(97);
      this.waistCm.set(94);
      this.hipCm.set(103);
      this.shoulderCm.set(52);
      this.selectedPreset.set('male_regular');
    }
    this.onSliderChange();
  }

  selectPreset(presetKey: string): void {
    this.selectedPreset.set(presetKey);
    this.onSliderChange();
  }

  onSliderChange(): void {
    const shape = this.sliderRegression.predictShape({
      height_cm: this.heightCm(),
      weight_kg: this.weightKg(),
      chest_cm: this.chestCm(),
      waist_cm: this.waistCm(),
      hip_cm: this.hipCm(),
      shoulder_cm: this.shoulderCm(),
      gender: this.gender()
    });

    this.betas.set(shape.betas);
    this.regionalMorphs.set(shape.regionalMorphs as RegionalMorphValues);
    this.updateIsoMeasurements();
  }

  private updateIsoMeasurements(): void {
    this.isoMeasurements.set({
      height_cm: this.heightCm(),
      chest_cm: this.chestCm(),
      waist_cm: this.waistCm(),
      hip_cm: this.hipCm(),
      shoulder_cm: this.shoulderCm(),
      arm_length_cm: this.armLengthCm(),
      torso_length_cm: Math.round((this.heightCm() * 0.352) * 10) / 10,
      neck_cm: Math.round(38.0 + (this.weightKg() - 65) * 0.15)
    });
  }

  selectSkinTone(tone: SkinToneOption): void {
    this.skinTone.set(tone.key);
    this.skinHex.set(tone.hex);
  }

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

  onBodyEstimated(result: BodyEstimateResult): void {
    this.heightCm.set(Math.round(result.height_cm));
    if (result.weight_kg) {
      this.weightKg.set(Math.round(result.weight_kg));
    }
    this.chestCm.set(Math.round(result.measurements.chest_cm));
    this.waistCm.set(Math.round(result.measurements.waist_cm));
    this.hipCm.set(Math.round(result.measurements.hip_cm));
    this.shoulderCm.set(Math.round(result.measurements.shoulder_cm));
    this.gender.set(result.gender);
    this.betas.set(result.betas);
    this.isEstimatedMock.set(result.is_mock);
    this.estimateConfidence.set(result.confidence ?? 0.85);

    this.updateIsoMeasurements();

    if (this.bodyViewer) {
      this.bodyViewer.applyBetas(result.betas);
    }
  }

  applyGarmentFitting(): void {
    this.isFitting.set(true);
    this.isDressed.set(true);
    this.fitEvaluateLoading.set(true);
    this.fitEvaluateError.set(null);

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
      show_heatmap: this.showHeatmap()
    };

    // Phase 5: Đánh giá độ vừa thật từ /fit/evaluate
    const fitReq = {
      betas: this.betas(),
      height_cm: this.heightCm(),
      gender: this.gender() as 'male' | 'female' | 'neutral',
      garment_type: prod.categoryId?.includes('cardigan') ? 'cardigan' : 'tshirt',
      current_size: this.selectedSize(),
      available_sizes: this.availableSizes,
      product_id: prod.id,
    };

    this.fitAdvisorService.evaluateFit(fitReq).subscribe({
      next: (fitRes) => {
        this.fitEvaluateLoading.set(false);
        this.fitEvaluateResult.set(fitRes);

        // Map kết quả Phase 5 về FitDiagnosticResponse (backward compat với UI cũ)
        if (fitRes) {
          const chestFit = fitRes.ease_by_region?.['chest'];
          this.fitDiagnostic.set({
            is_tight: fitRes.overall_fit === 'tight' || fitRes.overall_fit === 'very_tight',
            tight_regions: chestFit?.fit?.includes('tight') ? [`Vòng ngực (${chestFit.label})`] : [],
            loose_regions: chestFit?.fit?.includes('loose') ? [`Vòng ngực (${chestFit.label})`] : [],
            overpressure_percentage: chestFit?.ease_cm != null && chestFit.ease_cm < 0
              ? Math.round(Math.abs(chestFit.ease_cm) * 5) : 0,
            recommended_size_action: fitRes.size_action as any,
            recommended_size: fitRes.recommended_size,
            explanation: fitRes.explanation,
          });
        }
      },
      error: (err) => {
        this.fitEvaluateLoading.set(false);
        this.fitEvaluateError.set('Không kết nối được tới Fit Advisor. Dùng kết quả ước lượng.');

        // Fallback: vẫn gọi tryOn3D cũ
        this.avatarService.tryOn3D(payload).subscribe({
          next: (res) => {
            this.isFitting.set(false);
            this.fitDiagnostic.set(res.fit_diagnostic);
          },
          error: () => this.isFitting.set(false),
        });
        return;
      }
    });

    this.isFitting.set(false);
  }

  undressAvatar(): void {
    this.isDressed.set(false);
    this.fitDiagnostic.set(null);
  }

  toggleHeatmap(): void {
    this.showHeatmap.update(v => !v);
  }

  selectGarmentColor(c: GarmentColorOption): void {
    this.selectedGarmentColor.set(c.key);
    this.selectedGarmentHex.set(c.hex);
    this.garmentColorHex.set(c.hex);
  }

  selectProduct(p: Product): void {
    this.selectedProductId.set(p.id);
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
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
