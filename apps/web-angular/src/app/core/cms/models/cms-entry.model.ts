export interface CmsEntry<T = Record<string, unknown>> {
  id: string | number;
  attributes?: T;
  [key: string]: unknown;
}

export interface CmsCollectionResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CmsMediaResource {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}
