import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';

export interface GarmentAsset {
  asset_id: string;
  product_id: string;
  variant_id?: string;
  size?: string;
  asset_type: string;
  asset_version: number;
  storage_path: string;
  public_url: string;
  checksum: string;
  generation_mode: string;
  rigging_compatibility: string;
  validation_status: string;
  created_at: string;
}

export interface GarmentVariant {
  variant_id: string;
  product_id: string;
  size: string;
  measurements: Record<string, number>;
  stretch_pct: number;
  thickness_mm: number;
  generation_status: string;
  assets: GarmentAsset[];
  fitting_diagnostics?: {
    mesh_measurements?: Record<string, number>;
    ease_chest_cm?: number;
    is_tight?: boolean;
    zero_penetration_verified?: boolean;
  };
}

export interface GarmentProduct {
  product_id: string;
  sku: string;
  name: string;
  category: 'tshirt' | 'shirt' | 'cardigan' | 'jacket';
  description: string;
  status: 'draft' | 'processing' | 'ready_for_review' | 'published' | 'failed';
  material: string;
  stretch_pct: number;
  thickness_mm: number;
  primary_color_hex: string;
  pattern_description?: string;
  design_notes?: string;
  image_front_url: string;
  image_back_url?: string;
  created_at: string;
  updated_at: string;
  variants: GarmentVariant[];
  assets: GarmentAsset[];
}

export interface ImageAnalysisResponse {
  dominant_hex: string;
  dominant_rgb: number[];
  photo_aspect: number;
  aspect_warning?: {
    is_deviated: boolean;
    deviation_pct: number;
    photo_aspect: number;
    chart_aspect: number;
    message: string;
  };
  category_detected: string;
  mask_url: string;
  texture_url: string;
  warning_notes?: string;
}

export interface GarmentGenerationProgress {
  product_id: string;
  status: 'processing' | 'ready_for_review' | 'failed';
  progress_pct: number;
  current_size?: string;
  completed_sizes: string[];
  failed_sizes: string[];
  errors: string[];
  warnings: string[];
  product?: GarmentProduct;
}

@Injectable({
  providedIn: 'root'
})
export class GarmentStudioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8001/garment';

  getPublishedCatalog(): Observable<GarmentProduct[]> {
    return this.http.get<GarmentProduct[]>(`${this.baseUrl}/catalog`).pipe(
      catchError(() => {
        // Fallback to locally bundled catalog if server is in offline mock mode
        return this.http.get<any>('/assets/catalog/products.json').pipe(
          catchError(() => of([]))
        );
      })
    );
  }

  getAllCatalog(): Observable<GarmentProduct[]> {
    return this.http.get<GarmentProduct[]>(`${this.baseUrl}/catalog/all`).pipe(
      catchError(() => of([]))
    );
  }

  getCatalogProduct(productId: string): Observable<GarmentProduct | null> {
    return this.http.get<GarmentProduct>(`${this.baseUrl}/catalog/${productId}`).pipe(
      catchError(() => of(null))
    );
  }

  processStudioImage(formData: FormData): Observable<ImageAnalysisResponse> {
    return this.http.post<ImageAnalysisResponse>(`${this.baseUrl}/studio/process-image`, formData);
  }

  generate3d(payload: any): Observable<GarmentGenerationProgress> {
    return this.http.post<GarmentGenerationProgress>(`${this.baseUrl}/studio/generate-3d`, payload);
  }

  publishProduct(productId: string): Observable<GarmentProduct> {
    return this.http.post<GarmentProduct>(`${this.baseUrl}/studio/publish`, { product_id: productId });
  }
}
