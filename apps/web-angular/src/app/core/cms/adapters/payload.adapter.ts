import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CmsAdapter } from './cms.adapter';
import { CmsCollectionResponse } from '../models/cms-entry.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PayloadAdapter implements CmsAdapter {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.cmsApiBaseUrl;

  getCollection<T>(collectionName: string, queryParams?: Record<string, string | number | boolean>): Observable<CmsCollectionResponse<T>> {
    let params = new HttpParams().set('depth', '2');
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, val]) => {
        params = params.set(key, String(val));
      });
    }

    return this.http.get<{ docs: T[]; totalDocs: number; page: number; limit: number }>(
      `${this.baseUrl}/${collectionName}`,
      { params }
    ).pipe(
      map(res => ({
        items: res.docs || [],
        total: res.totalDocs || 0,
        page: res.page || 1,
        pageSize: res.limit || 10
      }))
    );
  }

  getEntryBySlug<T>(collectionName: string, slug: string): Observable<T | null> {
    const params = new HttpParams()
      .set('where[slug][equals]', slug)
      .set('depth', '2');

    return this.http.get<{ docs: T[] }>(
      `${this.baseUrl}/${collectionName}`,
      { params }
    ).pipe(
      map(res => (res.docs && res.docs.length > 0 ? res.docs[0] : null))
    );
  }

  normalizeMediaUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    const cdnBase = environment.mediaCdnBaseUrl || this.baseUrl.replace(/\/api$/, '');
    return `${cdnBase.replace(/\/$/, '')}/${rawUrl.replace(/^\//, '')}`;
  }
}
