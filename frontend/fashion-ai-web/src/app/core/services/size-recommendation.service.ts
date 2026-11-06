/**
 * Phase 5: Fit Advisor Service
 * ============================
 * Kết nối với /fit/evaluate (ML service) để đánh giá độ vừa thật.
 * Không hardcode giá trị "độ tin cậy 85%".
 * Fallback sang evaluate-quick (size_chart based) khi mesh GLB chưa có.
 */
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// ============================================================
// Interfaces - Phase 5 Fit Advisor
// ============================================================

export interface FitRegionResult {
  ease_cm: number | null;
  fit: 'very_tight' | 'tight' | 'perfect' | 'loose' | 'very_loose' | 'unknown';
  label: string;
  target_min?: number;
  target_comfortable?: number;
}

export interface GarmentMeshMeasurements {
  chest_cm: number;
  waist_cm: number;
  hip_cm: number;
  body_length_cm: number;
  sleeve_length_cm: number;
}

export interface HeatmapRegionStat {
  mean_mm: number;
  max_mm: number;
  min_mm: number;
  pct_tight: number;
  n_verts: number;
}

export interface FitEvaluateResponse {
  request_id: string;
  garment_measurements: GarmentMeasurements;
  ease_by_region: Record<string, FitRegionResult>;
  overall_fit: string;
  overall_fit_label: string;
  recommended_size: string;
  size_action: 'keep' | 'size_up' | 'size_down';
  confidence: number;
  heatmap_summary: Record<string, HeatmapRegionStat>;
  explanation: string;
  heatmap_task_id: string;
}

export interface GarmentMeasurements {
  chest_cm: number;
  waist_cm: number;
  hip_cm: number;
  body_length_cm: number;
  sleeve_length_cm: number;
}

export interface FitEvaluateRequest {
  betas: number[];
  height_cm: number;
  gender: 'male' | 'female' | 'neutral';
  garment_type: string;
  current_size: string;
  available_sizes?: string[];
  size_chart?: Record<string, any>;
  garment_glb_path?: string;
  product_id?: string;
}

export interface FitQuickResponse {
  source: 'size_chart_only';
  confidence: number;  // 0.55 khi chỉ dùng size_chart, không phải 0.85 hardcode
  ease_by_region: Record<string, FitRegionResult>;
  overall_fit: string;
  overall_fit_label: string;
  recommended_size: string;
  size_action: 'keep' | 'size_up' | 'size_down';
  body_measurements: Record<string, number>;
}

export interface HeatmapData {
  task_id: string;
  distances_mm: number[];
  heatmap_summary: Record<string, HeatmapRegionStat>;
  garment_vert_count: number;
}

// ============================================================
// Legacy SizeRecommendation (giữ lại để không break existing code)
// ============================================================
export interface BodyMeasurements {
  heightCm: number;
  weightKg?: number;
  chestCm?: number;
  waistCm?: number;
  hipCm?: number;
}

export interface MeasurementBreakdown {
  measurementName: string;
  bodyVal: number;
  garmentVal: number;
  actualEase: number;
  targetEase: number;
  status: 'perfect' | 'slightly_loose' | 'tight' | 'loose';
}

export interface SizeScoreItem {
  size: string;
  score: number;
  isWearable: boolean;
  chestEase?: number;
  waistEase?: number;
  hipEase?: number;
}

export interface SizeRecommendationResult {
  recommendedSize: string;
  alternativeSize?: string;
  confidenceScore: number;
  fitPreference: 'slim' | 'regular' | 'relaxed';
  explanation: string;
  measurementBreakdown: MeasurementBreakdown[];
  allScores: SizeScoreItem[];
  warnings: string[];
}


@Injectable({
  providedIn: 'root'
})
export class SizeRecommendationService {
  private readonly http = inject(HttpClient);

  /** URL gốc của ML service */
  private readonly mlBase = 'http://localhost:8001';

  // ============================================================
  // Phase 5: FIT EVALUATE (kết nối /fit/evaluate thật)
  // ============================================================

  /**
   * Đánh giá độ vừa đầy đủ từ mesh áo thật.
   * Số đo áo lấy từ mesh GLB đã dựng (không từ bảng size).
   * Heatmap tính từ khoảng cách đỉnh áo tới thân.
   * Confidence KHÔNG hardcode — phụ thuộc mức độ mesh đầy đủ.
   */
  evaluateFit(req: FitEvaluateRequest): Observable<FitEvaluateResponse> {
    return this.http.post<FitEvaluateResponse>(
      `${this.mlBase}/fit/evaluate`,
      req
    ).pipe(
      catchError((err) => {
        // Fallback: gọi evaluate-quick với size_chart nếu có
        if (req.size_chart) {
          return this.evaluateFitQuick(req);
        }
        // Nếu không có gì hết, trả fallback local
        return of(this._localFallbackFitResult(req));
      })
    );
  }

  /**
   * Đánh giá nhanh từ size_chart (không cần GLB).
   * confidence = 0.55 — KHÔNG phải 0.85 hardcode.
   */
  evaluateFitQuick(req: FitEvaluateRequest): Observable<any> {
    return this.http.post<FitQuickResponse>(
      `${this.mlBase}/fit/evaluate-quick`,
      req
    ).pipe(
      catchError(() => of(this._localFallbackFitResult(req)))
    );
  }

  /**
   * Lấy dữ liệu heatmap khoảng cách (mm) theo task_id.
   */
  getHeatmap(taskId: string): Observable<HeatmapData> {
    return this.http.get<HeatmapData>(`${this.mlBase}/fit/heatmap/${taskId}`);
  }

  // ============================================================
  // Legacy: recommend() - giữ lại cho backward compat
  // ============================================================

  recommend(
    categoryId: string,
    fitPreference: 'slim' | 'regular' | 'relaxed',
    measurements: BodyMeasurements
  ): Observable<SizeRecommendationResult> {
    const payload = {
      category_id: categoryId,
      fit_preference: fitPreference,
      measurements: {
        height_cm: measurements.heightCm,
        weight_kg: measurements.weightKg,
        chest_cm: measurements.chestCm,
        waist_cm: measurements.waistCm,
        hip_cm: measurements.hipCm
      }
    };

    return this.http.post<any>(`${this.mlBase}/fit/evaluate-quick`, payload).pipe(
      map(res => this._convertQuickToLegacy(res, categoryId, fitPreference, measurements)),
      catchError(() => of(this._calculateLocal(categoryId, fitPreference, measurements)))
    );
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private _localFallbackFitResult(req: FitEvaluateRequest): FitEvaluateResponse {
    /**
     * Fallback thuật toán nhân trắc học khi cả hai endpoints đều không phản hồi.
     * Tính ease từ số đo body + bảng size mặc định.
     * confidence = 0.45 (thấp nhất) để người dùng biết là dữ liệu ước lượng.
     */
    const sizeMap: Record<string, number> = {
      XS: 88, S: 94, M: 100, L: 106, XL: 114, XXL: 122
    };
    const garmentChest = sizeMap[req.current_size?.toUpperCase()] ?? 100;

    // Ước lượng ngực từ betas (beta[0] ~ ±3 ~ ±15cm từ baseline ~95cm)
    const betaChestDelta = (req.betas?.[0] ?? 0) * 5.0;
    const bodyChest = 95.0 + betaChestDelta;
    const ease = garmentChest - bodyChest;

    let fit: FitRegionResult['fit'] = 'perfect';
    let fitLabel = 'Vừa vặn';
    let sizeAction: 'keep' | 'size_up' | 'size_down' = 'keep';
    let recSize = req.current_size ?? 'M';

    if (ease < 0) { fit = 'very_tight'; fitLabel = 'Rất chật'; sizeAction = 'size_up'; }
    else if (ease < 4) { fit = 'tight'; fitLabel = 'Chật'; sizeAction = 'size_up'; }
    else if (ease < 16) { fit = 'perfect'; fitLabel = 'Vừa vặn'; }
    else { fit = 'loose'; fitLabel = 'Rộng'; sizeAction = 'size_down'; }

    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const idx = sizes.indexOf((req.current_size ?? 'M').toUpperCase());
    if (sizeAction === 'size_up' && idx < sizes.length - 1) recSize = sizes[idx + 1];
    if (sizeAction === 'size_down' && idx > 0) recSize = sizes[idx - 1];

    const exp = sizeAction === 'keep'
      ? `Size ${req.current_size} vừa vặn (ease ngực ≈ ${ease.toFixed(1)}cm).`
      : `Size ${req.current_size} ${fitLabel.toLowerCase()} (ease ngực ≈ ${ease.toFixed(1)}cm). Thử size ${recSize}.`;

    return {
      request_id: 'local_fallback',
      garment_measurements: {
        chest_cm: garmentChest,
        waist_cm: garmentChest * 0.96,
        hip_cm: garmentChest * 1.02,
        body_length_cm: 69,
        sleeve_length_cm: 21,
      },
      ease_by_region: {
        chest: { ease_cm: ease, fit, label: fitLabel }
      },
      overall_fit: fit,
      overall_fit_label: fitLabel,
      recommended_size: recSize,
      size_action: sizeAction,
      confidence: 0.45,   // thấp — dữ liệu offline
      heatmap_summary: {},
      explanation: exp,
      heatmap_task_id: '',
    };
  }

  private _convertQuickToLegacy(
    res: any,
    categoryId: string,
    fitPreference: string,
    measurements: BodyMeasurements
  ): SizeRecommendationResult {
    const chest = measurements.chestCm ?? 95;
    const easeRegion = res?.ease_by_region?.chest;
    const ease = easeRegion?.ease_cm ?? 0;
    const sizeMap: Record<string, number> = {
      XS: 88, S: 94, M: 100, L: 106, XL: 114, XXL: 122
    };
    const recSz = res?.recommended_size ?? 'M';
    const garmentVal = sizeMap[recSz] ?? 100;

    return {
      recommendedSize: recSz,
      alternativeSize: undefined,
      confidenceScore: Math.round((res?.confidence ?? 0.55) * 100),
      fitPreference: fitPreference as any,
      explanation: res?.explanation ?? '',
      measurementBreakdown: [{
        measurementName: 'Vòng ngực',
        bodyVal: Math.round(chest),
        garmentVal,
        actualEase: Math.round(ease),
        targetEase: 8,
        status: easeRegion?.fit === 'perfect' ? 'perfect' : (easeRegion?.fit?.includes('tight') ? 'tight' : 'slightly_loose'),
      }],
      allScores: [],
      warnings: [],
    };
  }

  private _calculateLocal(
    categoryId: string,
    fitPreference: 'slim' | 'regular' | 'relaxed',
    m: BodyMeasurements
  ): SizeRecommendationResult {
    const w = m.weightKg || ((m.heightCm - 100) * 0.9);
    const chest = m.chestCm || (0.52 * m.heightCm + 0.35 * w);
    const waist = m.waistCm || (0.42 * m.heightCm + 0.38 * w);
    const isBottom = categoryId === 'cat-pants' || categoryId === 'cat-jeans';

    const easeMap: Record<string, Record<string, number>> = {
      'cat-tshirts': { slim: 4, regular: 8, relaxed: 14 },
      'cat-jackets': { slim: 8, regular: 14, relaxed: 20 },
      'cat-pants':   { slim: 1.5, regular: 4, relaxed: 7 },
      'cat-jeans':   { slim: 1.0, regular: 3.5, relaxed: 6.5 }
    };

    const targetEase = easeMap[categoryId]?.[fitPreference] || 8;
    const sizeChart: Record<string, number> = isBottom
      ? { S: 74, M: 80, L: 86, XL: 92, XXL: 100 }
      : { S: 94, M: 100, L: 106, XL: 114, XXL: 122 };

    const primaryVal = isBottom ? waist : chest;
    const scores: SizeScoreItem[] = [];

    for (const [size, garmentDim] of Object.entries(sizeChart)) {
      const actualEase = garmentDim - primaryVal;
      let penalty = 0;
      if (actualEase < -0.5) {
        penalty = 60 + 10 * Math.pow(Math.abs(actualEase), 1.3);
      } else if (actualEase < targetEase) {
        penalty = 3.0 * (targetEase - actualEase);
      } else {
        penalty = 2.0 * (actualEase - targetEase);
      }
      const score = Math.max(10, Math.min(100, Math.round(100 - penalty)));
      scores.push({ size, score, isWearable: actualEase >= 0 });
    }

    scores.sort((a, b) => b.score - a.score);
    const top1 = scores[0];
    const top2 = scores[1]?.score >= 60 ? scores[1] : undefined;
    const actualTop1Ease = sizeChart[top1.size] - primaryVal;
    const prefLabel = fitPreference === 'slim'
      ? 'ôm vừa (Slim)'
      : (fitPreference === 'regular' ? 'tiêu chuẩn (Regular)' : 'rộng rãi (Relaxed)');

    return {
      recommendedSize: top1.size,
      alternativeSize: top2?.size,
      confidenceScore: top1.score,
      fitPreference,
      explanation: `Kích cỡ tối ưu nhất là ${top1.size} (Độ tương thích ${top1.score}%). ` +
        `Số đo của bạn là ${Math.round(primaryVal)}cm, sản phẩm size ${top1.size} có số đo ${sizeChart[top1.size]}cm ` +
        `tạo độ cử động dư ${actualTop1Ease.toFixed(1)}cm theo chuẩn phong cách ${prefLabel}.`,
      measurementBreakdown: [{
        measurementName: isBottom ? 'Vòng eo' : 'Vòng ngực',
        bodyVal: Math.round(primaryVal),
        garmentVal: sizeChart[top1.size],
        actualEase: Math.round(actualTop1Ease),
        targetEase,
        status: Math.abs(actualTop1Ease - targetEase) <= 2 ? 'perfect'
          : (actualTop1Ease < 0 ? 'tight' : 'slightly_loose')
      }],
      allScores: scores,
      warnings: [],
    };
  }
}
