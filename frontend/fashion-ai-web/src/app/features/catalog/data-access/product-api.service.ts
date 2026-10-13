import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';
import { Product } from '../models/product.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductApiService {
  private readonly api = inject(ApiClientService);

  getProducts(category?: string): Observable<ApiResponse<Product[]>> {
    return this.api.get<Product[]>('catalog/products', category ? { category } : undefined);
  }

  getProductBySlug(slug: string): Observable<ApiResponse<Product>> {
    return this.api.get<Product>(`catalog/products/${slug}`);
  }
}
