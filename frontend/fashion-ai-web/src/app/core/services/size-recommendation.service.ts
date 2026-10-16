import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
  private readonly apiUrl = 'http://localhost:8000/internal/v1/sizing/recommend';

  /**
   * Tính toán đề xuất kích cỡ giải thích được (Explainable Fit Scoring).
   * Hỗ trợ gọi trực tiếp tới FastAPI microservice, đồng thời tích hợp fallback
   * thuật toán nhân trắc học cục bộ khi microservice chưa khởi chạy.
   */
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

    return this.http.post<any>(this.apiUrl, payload).pipe(
      catchError(() => {
        // Fallback thuật toán nhân trắc học chạy trực tiếp tại Client
        return of(this.calculateLocal(categoryId, fitPreference, measurements));
      })
    );
  }

  private calculateLocal(
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
      scores.push({
        size,
        score,
        isWearable: actualEase >= 0
      });
    }

    scores.sort((a, b) => b.score - a.score);
    const top1 = scores[0];
    const top2 = scores[1]?.score >= 60 ? scores[1] : undefined;

    const actualTop1Ease = sizeChart[top1.size] - primaryVal;
    const prefLabel = fitPreference === 'slim' ? 'ôm vừa (Slim)' : (fitPreference === 'regular' ? 'tiêu chuẩn (Regular)' : 'rộng rãi (Relaxed)');

    return {
      recommendedSize: top1.size,
      alternativeSize: top2?.size,
      confidenceScore: top1.score,
      fitPreference,
      explanation: `Kích cỡ tối ưu nhất là ${top1.size} (Độ tương thích ${top1.score}%). Số đo của bạn là ${Math.round(primaryVal)}cm, sản phẩm size ${top1.size} có số đo ${sizeChart[top1.size]}cm tạo độ cử động dư ${actualTop1Ease.toFixed(1)}cm theo chuẩn phong cách ${prefLabel}.`,
      measurementBreakdown: [
        {
          measurementName: isBottom ? 'Vòng eo' : 'Vòng ngực',
          bodyVal: Math.round(primaryVal),
          garmentVal: sizeChart[top1.size],
          actualEase: Math.round(actualTop1Ease),
          targetEase,
          status: Math.abs(actualTop1Ease - targetEase) <= 2 ? 'perfect' : (actualTop1Ease < 0 ? 'tight' : 'slightly_loose')
        }
      ],
      allScores: scores,
      warnings: []
    };
  }
}
