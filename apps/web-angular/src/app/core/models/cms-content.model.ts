export interface CmsImageVariant {
  url: string;
  width?: number;
  height?: number;
}

export interface CmsImage {
  id?: string | number;
  url: string;
  alternativeText?: string;
  caption?: string;
  formats?: {
    thumbnail?: CmsImageVariant;
    small?: CmsImageVariant;
    medium?: CmsImageVariant;
    large?: CmsImageVariant;
  };
}

export interface StudioFeature {
  id: string;
  title: string;
  description: string;
  icon?: string;
}
