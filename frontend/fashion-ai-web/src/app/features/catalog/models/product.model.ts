export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  colorCode?: string;
  colorHex?: string;
  stockQuantity: number;
  priceModifier: number;
  garmentImageUrl: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  sizeBought: string;
  fitAssessment: 'Hơi chật' | 'Vừa vặn hoàn hảo' | 'Hơi rộng';
  comment: string;
  userPhoto?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  basePrice: number;
  originalPrice?: number;
  thumbnailUrl: string;
  images: string[];
  variants: ProductVariant[];
  inStock: boolean;
  featured?: boolean;
  rating?: number;
  reviewCount?: number;
  productCode?: string;
  fitRecommendation?: string;
  styleHintImages?: string[];
  reviews?: ReviewItem[];
  videoUrl?: string;
}
