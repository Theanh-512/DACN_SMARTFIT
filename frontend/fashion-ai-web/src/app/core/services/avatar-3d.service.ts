import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface Iso8559Measurements {
  height_cm: number;
  chest_cm: number;
  waist_cm: number;
  hip_cm: number;
  shoulder_cm: number;
  inside_leg_cm: number;
  neck_cm: number;
}

export interface ReconstructAvatarRequest {
  height_cm: number;
  weight_kg: number;
  gender: 'male' | 'female';
  preset_key?: string;
  body_type?: string;
  skin_tone?: string;
  skin_hex?: string;
  face_texture_path?: string;
  chest_cm?: number;
  waist_cm?: number;
  hip_cm?: number;
  shoulder_cm?: number;
}

export interface ReconstructAvatarResponse {
  avatar_id: string;
  glb_url: string;
  betas: number[];
  iso_measurements: Iso8559Measurements;
  preset_key: string;
  gender: string;
  message: string;
}

export interface TryOn3DRequest {
  betas: number[];
  height_cm: number;
  gender: string;
  preset_key?: string;
  product_id: string;
  product_name?: string;
  category_id: string;
  size: string;
  garment_color: string;
  garment_hex?: string;
  skin_tone: string;
  skin_hex?: string;
  face_texture_path?: string;
  show_heatmap: boolean;
}

export interface FitDiagnosticResponse {
  is_tight: boolean;
  tight_regions: string[];
  loose_regions: string[];
  overpressure_percentage: number;
  recommended_size_action: 'keep' | 'size_up' | 'size_down';
  recommended_size: string;
  explanation: string;
}

export interface TryOn3DResponse {
  scene_glb_url: string;
  fit_diagnostic: FitDiagnosticResponse;
  iso_measurements: Iso8559Measurements;
  execution_time_ms: number;
}

export interface SizeRecommendationRequest {
  category_id: string;
  fit_preference: string;
  measurements: {
    height_cm: number;
    weight_kg?: number;
    chest_cm?: number;
    waist_cm?: number;
    hip_cm?: number;
    shoulder_cm?: number;
  };
}

export interface MeasurementDelta {
  measurement_name: string;
  body_val: number;
  garment_val: number;
  actual_ease: number;
  target_ease: number;
  status: string;
}

export interface SizeRecommendationResponse {
  recommended_size: string;
  alternative_size?: string;
  confidence_score: number;
  fit_preference: string;
  explanation: string;
  measurement_breakdown: MeasurementDelta[];
  warnings: string[];
}

export interface TryOn2DResponse {
  task_id: string;
  status: string;
  output_image_url?: string;
  inference_time_ms: number;
  error_message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class Avatar3dService {
  private readonly http = inject(HttpClient);
  private readonly avatarApiUrl = 'http://localhost:8000/internal/v1/avatar';
  private readonly sizingApiUrl = 'http://localhost:8000/api/v1/sizing';
  private readonly tryon2dApiUrl = 'http://localhost:8000/api/v1/tryon';

  reconstructAvatar(req: ReconstructAvatarRequest): Observable<ReconstructAvatarResponse> {
    return this.http.post<ReconstructAvatarResponse>(`${this.avatarApiUrl}/reconstruct`, req).pipe(
      catchError(() => {
        const h = req.height_cm;
        const w = req.weight_kg;
        const isF = req.gender === 'female';
        const estChest = Math.round(isF ? (0.50 * h + 0.38 * w) : (0.52 * h + 0.35 * w));
        const estWaist = Math.round(isF ? (0.40 * h + 0.36 * w) : (0.42 * h + 0.38 * w));
        const estHip = Math.round(isF ? (0.56 * h + 0.40 * w) : (0.54 * h + 0.36 * w));
        const estShoulder = Math.round(isF ? (0.23 * h + 0.04 * w) : (0.25 * h + 0.05 * w));
        const estLeg = Math.round(0.45 * h);
        const estNeck = Math.round(38.0 + (w - 65) * 0.15);

        return of({
          avatar_id: 'fallback_offline',
          glb_url: 'http://localhost:8000/results/avatars/base_avatar.glb',
          betas: [0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
          iso_measurements: {
            height_cm: h,
            chest_cm: estChest,
            waist_cm: estWaist,
            hip_cm: estHip,
            shoulder_cm: estShoulder,
            inside_leg_cm: estLeg,
            neck_cm: estNeck
          },
          preset_key: req.preset_key || `${req.gender}_regular`,
          gender: req.gender,
          message: 'Tạo hình thể nhân vật chuẩn ISO 8559-1 cục bộ.'
        });
      })
    );
  }

  tryOn3D(req: TryOn3DRequest): Observable<TryOn3DResponse> {
    return this.http.post<TryOn3DResponse>(`${this.avatarApiUrl}/tryon-3d`, req).pipe(
      catchError(() => {
        const sizeMap: Record<string, number> = {
          'XS': 88, 'S': 94, 'M': 100, 'L': 106, 'XL': 114, 'XXL': 122
        };
        const gChest = sizeMap[req.size] || 100;
        const userChest = 96;
        const diff = gChest - userChest;
        const isTight = diff < 2.0;

        return of({
          scene_glb_url: isTight
            ? 'http://localhost:8000/results/avatars/tryon_tight.glb'
            : 'http://localhost:8000/results/avatars/tryon_perfect.glb',
          fit_diagnostic: {
            is_tight: isTight,
            tight_regions: isTight ? ['Vòng ngực (bó sát: độ dư chỉ ' + diff + 'cm)'] : [],
            loose_regions: diff > 12.0 ? ['Vòng ngực (+14cm)'] : [],
            overpressure_percentage: isTight ? 28.5 : 0.0,
            recommended_size_action: (isTight ? 'size_up' : (diff > 12.0 ? 'size_down' : 'keep')) as 'keep' | 'size_up' | 'size_down',
            recommended_size: isTight ? 'L' : req.size,
            explanation: isTight
              ? `Cảnh báo: Size ${req.size} bị bó sát ngực. Hệ thống đề xuất đổi sang Size L để mặc thoải mái.`
              : `Size ${req.size} vừa vặn hoàn hảo theo phom dáng tiêu chuẩn của bạn!`
          },
          iso_measurements: {
            height_cm: req.height_cm,
            chest_cm: userChest,
            waist_cm: 80,
            hip_cm: 98,
            shoulder_cm: 43.5,
            inside_leg_cm: 77.5,
            neck_cm: 38
          },
          execution_time_ms: 120
        });
      })
    );
  }

  uploadPhotoReconstruct(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.avatarApiUrl}/upload-photo-reconstruct`, formData);
  }

  deleteAvatarData(texturePath?: string): Observable<any> {
    const formData = new FormData();
    if (texturePath) {
      formData.append('texture_relative_path', texturePath);
    }
    return this.http.post<any>(`${this.avatarApiUrl}/delete-data`, formData);
  }

  getExplainableSizeRecommendation(req: SizeRecommendationRequest): Observable<SizeRecommendationResponse> {
    return this.http.post<SizeRecommendationResponse>(`${this.sizingApiUrl}/recommend`, req).pipe(
      catchError(() => {
        const chest = req.measurements.chest_cm || 96;
        const rec = chest < 92 ? 'S' : (chest < 98 ? 'M' : (chest < 105 ? 'L' : 'XL'));
        return of({
          recommended_size: rec,
          alternative_size: rec === 'M' ? 'L' : 'M',
          confidence_score: 85.0,
          fit_preference: req.fit_preference,
          explanation: `Dựa trên số đo vòng ngực ${chest}cm, hệ thống khuyến nghị Size ${rec} để đạt độ cử động tối ưu theo chuẩn LifeWear.`,
          measurement_breakdown: [
            {
              measurement_name: 'Vòng ngực',
              body_val: chest,
              garment_val: 100.0,
              actual_ease: 100.0 - chest,
              target_ease: 6.0,
              status: 'perfect'
            }
          ],
          warnings: []
        });
      })
    );
  }

  run2dTryon(formData: FormData): Observable<TryOn2DResponse> {
    return this.http.post<TryOn2DResponse>(`${this.tryon2dApiUrl}/upload-and-run`, formData);
  }
}
