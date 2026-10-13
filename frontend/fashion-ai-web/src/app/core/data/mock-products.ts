import { Product } from '../../features/catalog/models/product.model';

export interface Category {
  id: string;
  name: string;
  slug: string;
  gender: 'women' | 'men' | 'kids' | 'unisex';
  icon?: string;
  imageUrl?: string;
  itemCount: number;
}

export const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat-women-tops',
    name: 'Áo Nữ',
    slug: 'ao-nu',
    gender: 'women',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    itemCount: 42
  },
  {
    id: 'cat-women-dresses',
    name: 'Đầm & Chân Váy',
    slug: 'dam-vay-nu',
    gender: 'women',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
    itemCount: 28
  },
  {
    id: 'cat-women-pants',
    name: 'Quần & Jeans Nữ',
    slug: 'quan-nu',
    gender: 'women',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    itemCount: 35
  },
  {
    id: 'cat-men-tops',
    name: 'Áo Nam',
    slug: 'ao-nam',
    gender: 'men',
    imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=600&q=80',
    itemCount: 38
  },
  {
    id: 'cat-men-jackets',
    name: 'Áo Khoác Nam',
    slug: 'ao-khoac-nam',
    gender: 'men',
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    itemCount: 19
  },
  {
    id: 'cat-men-pants',
    name: 'Quần Nam',
    slug: 'quan-nam',
    gender: 'men',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    itemCount: 26
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    name: 'Áo Blazer Linen Cổ Điển Tối Giản',
    slug: 'ao-blazer-linen-co-dien',
    description: 'Chất liệu vải lanh tự nhiên pha cotton thoáng mát, form đứng nhẹ nhàng chuẩn phong cách LifeWear tối giản. Dễ phối hợp trang phục công sở lẫn dạo phố.',
    categoryId: 'cat-women-tops',
    categoryName: 'Áo Khoác Nữ',
    basePrice: 899000,
    originalPrice: 1199000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554412933-514a83d2f3c8?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v1-1', sku: 'BLZ-BLK-S', size: 'S', color: 'Đen', stockQuantity: 15, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80' },
      { id: 'v1-2', sku: 'BLZ-BLK-M', size: 'M', color: 'Đen', stockQuantity: 24, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80' },
      { id: 'v1-3', sku: 'BLZ-BEI-S', size: 'S', color: 'Beige', stockQuantity: 18, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' },
      { id: 'v1-4', sku: 'BLZ-BEI-M', size: 'M', color: 'Beige', stockQuantity: 20, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80' }
    ],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-002',
    name: 'Áo Thun Cotton Supima Cổ Tròn',
    slug: 'ao-thun-cotton-supima-co-tron',
    description: '100% sợi bông Supima quý hiếm siêu mịn, bóng mượt tự nhiên và giữ phom bền bỉ sau nhiều lần giặt. Chiếc áo cơ bản không thể thiếu.',
    categoryId: 'cat-men-tops',
    categoryName: 'Áo Thun Nam',
    basePrice: 349000,
    originalPrice: 399000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v2-1', sku: 'TSH-WHT-M', size: 'M', color: 'Trắng', stockQuantity: 50, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
      { id: 'v2-2', sku: 'TSH-WHT-L', size: 'L', color: 'Trắng', stockQuantity: 45, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
      { id: 'v2-3', sku: 'TSH-BLK-M', size: 'M', color: 'Đen', stockQuantity: 30, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80' }
    ],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-003',
    name: 'Đầm Maxi Lụa Cổ Chữ V Xòe Nhẹ',
    slug: 'dam-maxi-lua-co-chu-v',
    description: 'Thiết kế dáng xòe tôn đường cong nhẹ nhàng, chất vải lụa tơ nhân tạo óng ả, rũ tự nhiên, mang lại cảm giác thoáng mát tối đa suốt cả ngày.',
    categoryId: 'cat-women-dresses',
    categoryName: 'Đầm Nữ',
    basePrice: 1290000,
    originalPrice: 1590000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v3-1', sku: 'DRS-OLV-S', size: 'S', color: 'Xanh Rêu', stockQuantity: 12, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
      { id: 'v3-2', sku: 'DRS-OLV-M', size: 'M', color: 'Xanh Rêu', stockQuantity: 15, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' }
    ],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-004',
    name: 'Quần Jeans Dáng Suông Cạp Cao',
    slug: 'quan-jeans-dang-suong-cap-cao',
    description: 'Chất denim 100% cotton tự nhiên dệt chéo chuẩn Nhật, cạp cao tôn dáng dài chân, đường wash màu tự nhiên và sắc sảo.',
    categoryId: 'cat-women-pants',
    categoryName: 'Quần Nữ',
    basePrice: 799000,
    originalPrice: 950000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v4-1', sku: 'JNS-BLU-26', size: '26', color: 'Xanh Nhạt', stockQuantity: 20, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' },
      { id: 'v4-2', sku: 'JNS-BLU-27', size: '27', color: 'Xanh Nhạt', stockQuantity: 25, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' },
      { id: 'v4-3', sku: 'JNS-BLU-28', size: '28', color: 'Xanh Nhạt', stockQuantity: 18, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80' }
    ],
    inStock: true,
    featured: false
  },
  {
    id: 'prod-005',
    name: 'Áo Khoác Bomber Chống Thấm Gió',
    slug: 'ao-khoac-bomber-chong-tham-gio',
    description: 'Lớp vải bề mặt công nghệ kháng nước nhẹ, lớp lót thoáng khí giữ nhiệt hiệu quả. Phù hợp cho những chuyến đi ngoài trời và thời tiết se lạnh.',
    categoryId: 'cat-men-jackets',
    categoryName: 'Áo Khoác Nam',
    basePrice: 1190000,
    originalPrice: 1490000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v5-1', sku: 'BMB-BLK-L', size: 'L', color: 'Đen Than', stockQuantity: 14, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' },
      { id: 'v5-2', sku: 'BMB-BLK-XL', size: 'XL', color: 'Đen Than', stockQuantity: 10, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80' }
    ],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-006',
    name: 'Áo Sơ Mi Oxford Dài Tay Form Regular',
    slug: 'ao-so-mi-oxford-dai-tay',
    description: 'Chất vải dệt Oxford dày dặn đặc trưng nhưng êm ái, bề mặt có gân vải nhám nhẹ tinh tế, cổ áo có nút giữ form luôn lịch lãm.',
    categoryId: 'cat-men-tops',
    categoryName: 'Áo Sơ Mi Nam',
    basePrice: 599000,
    originalPrice: 699000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v6-1', sku: 'OXF-BLU-M', size: 'M', color: 'Xanh Da Trời', stockQuantity: 30, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80' },
      { id: 'v6-2', sku: 'OXF-WHT-M', size: 'M', color: 'Trắng', stockQuantity: 28, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80' }
    ],
    inStock: true,
    featured: false
  },
  {
    id: 'prod-007',
    name: 'Quần Chino Co Giãn 4 Chiều Kando',
    slug: 'quan-chino-co-gian-4-chieu',
    description: 'Công nghệ sợi đàn hồi siêu nhẹ, nhanh khô và hạn chế nếp nhăn. Dáng suông gọn gàng thích hợp cho cả công sở và hoạt động thường nhật.',
    categoryId: 'cat-men-pants',
    categoryName: 'Quần Nam',
    basePrice: 699000,
    originalPrice: 850000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v7-1', sku: 'CHIN-BEI-30', size: '30', color: 'Beige', stockQuantity: 22, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80' },
      { id: 'v7-2', sku: 'CHIN-NVY-31', size: '31', color: 'Navy', stockQuantity: 17, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=800&q=80' }
    ],
    inStock: true,
    featured: true
  },
  {
    id: 'prod-008',
    name: 'Áo Cardigan Dệt Kim Mềm Cổ V',
    slug: 'ao-cardigan-det-kim-mem',
    description: 'Sợi len pha cotton dệt mật độ cao mang lại cảm giác ấm áp nhẹ nhàng, hàng cúc xà cừ tinh tế cùng viền bo tay giữ nhiệt tốt.',
    categoryId: 'cat-women-tops',
    categoryName: 'Áo Nữ',
    basePrice: 649000,
    originalPrice: 799000,
    thumbnailUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v8-1', sku: 'CRD-CRM-M', size: 'M', color: 'Kem Trắng', stockQuantity: 16, priceModifier: 0, garmentImageUrl: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=800&q=80' }
    ],
    inStock: true,
    featured: false
  }
];

export const MOCK_TRYON_MODELS = [
  {
    id: 'model-f1',
    name: 'Mẫu Nữ Mai Anh (1m65 - 50kg)',
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-f2',
    name: 'Mẫu Nữ Lan Thy (1m70 - 54kg)',
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-m1',
    name: 'Mẫu Nam Tuấn Kiệt (1m78 - 68kg)',
    gender: 'male',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-m2',
    name: 'Mẫu Nam Hoàng Hải (1m82 - 75kg)',
    gender: 'male',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'
  }
];
