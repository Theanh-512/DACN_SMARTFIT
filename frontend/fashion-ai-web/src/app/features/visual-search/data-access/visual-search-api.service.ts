import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../../core/http/api-client.service';
import { VisualSearchResponse } from '../models/visual-search.model';
import { ApiResponse } from '../../../core/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class VisualSearchApiService {
  private readonly api = inject(ApiClientService);

  searchByImage(imageFile: File, limit: number = 10): Observable<ApiResponse<VisualSearchResponse>> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('limit', String(limit));

    return this.api.post<VisualSearchResponse>('catalog/visual-search', formData);
  }
}
