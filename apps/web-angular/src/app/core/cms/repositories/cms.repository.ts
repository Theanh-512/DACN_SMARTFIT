import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CmsAdapter } from '../adapters/cms.adapter';
import { StrapiAdapter } from '../adapters/strapi.adapter';
import { PayloadAdapter } from '../adapters/payload.adapter';
import { CmsCollectionResponse } from '../models/cms-entry.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CmsRepository {
  private readonly strapiAdapter = inject(StrapiAdapter);
  private readonly payloadAdapter = inject(PayloadAdapter);

  private get activeAdapter(): CmsAdapter {
    return environment.cmsProvider === 'payload' ? this.payloadAdapter : this.strapiAdapter;
  }

  getCollection<T>(collection: string, params?: Record<string, string | number | boolean>): Observable<CmsCollectionResponse<T>> {
    return this.activeAdapter.getCollection<T>(collection, params);
  }

  getEntryBySlug<T>(collection: string, slug: string): Observable<T | null> {
    return this.activeAdapter.getEntryBySlug<T>(collection, slug);
  }

  getMediaUrl(rawUrl: string): string {
    return this.activeAdapter.normalizeMediaUrl(rawUrl);
  }
}
