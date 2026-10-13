import { Observable } from 'rxjs';
import { CmsCollectionResponse, CmsMediaResource } from '../models/cms-entry.model';

export interface CmsAdapter {
  getCollection<T>(collectionName: string, queryParams?: Record<string, string | number | boolean>): Observable<CmsCollectionResponse<T>>;
  getEntryBySlug<T>(collectionName: string, slug: string): Observable<T | null>;
  normalizeMediaUrl(rawUrl: string): string;
}
