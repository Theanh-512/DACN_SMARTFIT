import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { CmsAdapter } from './cms.adapter';
import { CmsCollectionResponse } from '../models/cms-entry.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StrapiAdapter implements CmsAdapter {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.cmsApiBaseUrl;

  getCollection<T>(collectionName: string, queryParams?: Record<string, string | number | boolean>): Observable<CmsCollectionResponse<T>> {
    let params = new HttpParams().set('populate', '*');
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, val]) => {
        params = params.set(key, String(val));
      });
    }

    return this.http.get<{ data: Array<{ id: number; attributes?: T } & T>; meta?: { pagination?: { total: number; page: number; pageSize: number } } }>(
      `${this.baseUrl}/${collectionName}`,
      { params }
    ).pipe(
      map(res => {
        const items = (res.data || []).map(item => {
          if (item.attributes) {
            return { id: item.id, ...item.attributes } as unknown as T;
          }
          return item as unknown as T;
        });

        return {
          items,
          total: res.meta?.pagination?.total ?? items.length,
          page: res.meta?.pagination?.page ?? 1,
          pageSize: res.meta?.pagination?.pageSize ?? items.length
        };
      })
    );
  }

  getEntryBySlug<T>(collectionName: string, slug: string): Observable<T | null> {
    const params = new HttpParams()
      .set('filters[slug][$eq]', slug)
      .set('populate', '*');

    return this.http.get<{ data: Array<{ id: number; attributes?: T } & T> }>(
      `${this.baseUrl}/${collectionName}`,
      { params }
    ).pipe(
      map(res => {
        if (!res.data || res.data.length === 0) return null;
        const first = res.data[0];
        return (first.attributes ? { id: first.id, ...first.attributes } : first) as unknown as T;
      })
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
