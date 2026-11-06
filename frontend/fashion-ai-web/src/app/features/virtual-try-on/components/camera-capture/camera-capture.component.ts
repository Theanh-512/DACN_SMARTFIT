import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  signal,
  ViewChild,
  ElementRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Avatar3dService, BodyEstimateApiResponse } from '../../../../core/services/avatar-3d.service';

export interface BodyEstimateResult {
  betas: number[];
  measurements: {
    height_cm: number;
    chest_cm: number;
    waist_cm: number;
    hip_cm: number;
    shoulder_cm: number;
    arm_length_cm?: number;
    torso_length_cm?: number;
  };
  height_cm: number;
  weight_kg?: number;
  gender: 'male' | 'female';
  is_mock: boolean;
  confidence?: number;
}

@Component({
  selector: 'app-camera-capture',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './camera-capture.component.html',
  styleUrls: ['./camera-capture.component.scss']
})
export class CameraCaptureComponent implements OnInit, OnDestroy {
  private readonly avatarService = inject(Avatar3dService);

  @ViewChild('videoElement') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('captureCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  @Output() close = new EventEmitter<void>();
  @Output() estimated = new EventEmitter<BodyEstimateResult>();

  // Camera stream state
  mediaStream: MediaStream | null = null;
  cameraError = signal<string | null>(null);
  isCameraActive = signal<boolean>(false);

  // Workflow steps: 'front' -> 'side' -> 'confirm'
  currentStep = signal<'front' | 'side' | 'confirm'>('front');

  // Captured photo URLs & Blobs
  frontPhotoUrl = signal<string | null>(null);
  sidePhotoUrl = signal<string | null>(null);
  frontBlob: Blob | null = null;
  sideBlob: Blob | null = null;

  // Form parameters
  heightCm = signal<number>(175);
  weightKg = signal<number | null>(70);
  gender = signal<'male' | 'female'>('male');
  privacyAgreed = signal<boolean>(false);

  // Processing & Error states
  isProcessing = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  errorCode = signal<string | null>(null);
  isMockBadge = signal<boolean>(false);

  async ngOnInit(): Promise<void> {
    await this.startCamera();
  }

  ngOnDestroy(): void {
    this.stopCamera();
    this.cleanupPhotoUrls();
  }

  async startCamera(): Promise<void> {
    this.cameraError.set(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt không hỗ trợ truy cập Camera hoặc kết nối chưa an toàn (cần HTTPS hoặc localhost).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 1920 }
        },
        audio: false
      });

      this.mediaStream = stream;
      this.isCameraActive.set(true);

      setTimeout(() => {
        if (this.videoRef?.nativeElement) {
          this.videoRef.nativeElement.srcObject = stream;
          this.videoRef.nativeElement.play().catch(e => console.warn('Video play error:', e));
        }
      }, 100);
    } catch (err: any) {
      console.error('Camera access failed:', err);
      this.cameraError.set(
        err.name === 'NotAllowedError'
          ? 'Quyền truy cập Camera bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.'
          : err.message || 'Không thể mở Camera.'
      );
      this.isCameraActive.set(false);
    }
  }

  stopCamera(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.isCameraActive.set(false);
  }

  captureCurrentFrame(): void {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;
    if (!video || !canvas) return;

    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);

    canvas.toBlob(blob => {
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      if (this.currentStep() === 'front') {
        this.frontBlob = blob;
        this.frontPhotoUrl.set(url);
        // Advance to side view prompt
        this.currentStep.set('side');
      } else if (this.currentStep() === 'side') {
        this.sideBlob = blob;
        this.sidePhotoUrl.set(url);
        // Advance to confirmation form
        this.currentStep.set('confirm');
      }
    }, 'image/jpeg', 0.92);
  }

  retakeCurrentStep(): void {
    if (this.currentStep() === 'side') {
      if (this.sidePhotoUrl()) {
        URL.revokeObjectURL(this.sidePhotoUrl()!);
        this.sidePhotoUrl.set(null);
        this.sideBlob = null;
      } else {
        // Back to front
        if (this.frontPhotoUrl()) {
          URL.revokeObjectURL(this.frontPhotoUrl()!);
          this.frontPhotoUrl.set(null);
          this.frontBlob = null;
        }
        this.currentStep.set('front');
      }
    } else if (this.currentStep() === 'confirm') {
      this.currentStep.set('side');
    } else {
      if (this.frontPhotoUrl()) {
        URL.revokeObjectURL(this.frontPhotoUrl()!);
        this.frontPhotoUrl.set(null);
        this.frontBlob = null;
      }
      this.currentStep.set('front');
    }
  }

  skipSidePhoto(): void {
    this.sideBlob = null;
    if (this.sidePhotoUrl()) {
      URL.revokeObjectURL(this.sidePhotoUrl()!);
      this.sidePhotoUrl.set(null);
    }
    this.currentStep.set('confirm');
  }

  submitEstimation(): void {
    if (!this.frontBlob) {
      this.errorMessage.set('Thiếu ảnh chính diện.');
      return;
    }
    if (!this.privacyAgreed()) {
      this.errorMessage.set('Vui lòng đồng ý với điều khoản bảo mật xử lý ảnh.');
      return;
    }

    const h = Number(this.heightCm());
    if (isNaN(h) || h < 120 || h > 230) {
      this.errorMessage.set('Chiều cao phải từ 120 đến 230 cm.');
      return;
    }

    this.isProcessing.set(true);
    this.errorMessage.set(null);
    this.errorCode.set(null);

    this.avatarService.estimateBodyFromPhotos(
      this.frontBlob,
      this.sideBlob || undefined,
      h,
      this.weightKg() || undefined,
      true
    ).subscribe({
      next: (res: BodyEstimateApiResponse) => {
        this.isProcessing.set(false);
        this.isMockBadge.set(res.is_mock);

        this.estimated.emit({
          betas: res.betas,
          measurements: res.measurements as any,
          height_cm: res.height_cm,
          weight_kg: res.weight_kg,
          gender: this.gender(),
          is_mock: res.is_mock,
          confidence: res.confidence
        });

        this.closeModal();
      },
      error: (err: any) => {
        this.isProcessing.set(false);
        console.error('Body estimation error:', err);

        let msg = 'Ước lượng vóc dáng thất bại. Vui lòng thử lại.';
        let code = 'ERR_UNKNOWN';

        if (err.error?.detail) {
          const detail = err.error.detail;
          msg = detail;
          const match = detail.match(/\[(ERR_[A-Z_]+)\]/);
          if (match) {
            code = match[1];
          }
        }

        this.errorCode.set(code);
        this.errorMessage.set(msg);
      }
    });
  }

  closeModal(): void {
    this.stopCamera();
    this.close.emit();
  }

  private cleanupPhotoUrls(): void {
    if (this.frontPhotoUrl()) {
      URL.revokeObjectURL(this.frontPhotoUrl()!);
    }
    if (this.sidePhotoUrl()) {
      URL.revokeObjectURL(this.sidePhotoUrl()!);
    }
  }
}

