export interface ProductVariant {
  id: string;
  sku: string;
  size: string;
  color: string;
  stockQuantity: number;
  priceModifier: number;
  garmentImageUrl: string;
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
}
