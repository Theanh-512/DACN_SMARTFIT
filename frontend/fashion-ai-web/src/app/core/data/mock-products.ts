import { Product, ReviewItem } from '../../features/catalog/models/product.model';

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
    "id": "cat-jackets",
    "name": "Áo Khoác",
    "slug": "ao-khoac",
    "gender": "unisex",
    "imageUrl": "https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg",
    "itemCount": 69
  },
  {
    "id": "cat-fleece",
    "name": "Áo Lông Cừu",
    "slug": "ao-long-cuu",
    "gender": "unisex",
    "imageUrl": "https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg",
    "itemCount": 18
  },
  {
    "id": "cat-tshirts",
    "name": "Áo Thun",
    "slug": "ao-thun",
    "gender": "unisex",
    "imageUrl": "https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg",
    "itemCount": 48
  },
  {
    "id": "cat-shirts",
    "name": "Sơ Mi",
    "slug": "so-mi",
    "gender": "unisex",
    "imageUrl": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80",
    "itemCount": 36
  },
  {
    "id": "cat-pants",
    "name": "Quần Dài",
    "slug": "quan-dai",
    "gender": "unisex",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750",
    "itemCount": 56
  },
  {
    "id": "cat-jeans",
    "name": "Quần Jeans",
    "slug": "quan-jeans",
    "gender": "unisex",
    "imageUrl": "https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg",
    "itemCount": 32
  },
  {
    "id": "cat-dresses",
    "name": "Đầm & Váy",
    "slug": "dam-vay",
    "gender": "women",
    "imageUrl": "https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg",
    "itemCount": 29
  },
  {
    "id": "cat-loungewear",
    "name": "Đồ Mặc Nhà",
    "slug": "do-mac-nha",
    "gender": "unisex",
    "imageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750",
    "itemCount": 24
  },
  {
    "id": "cat-innerwear",
    "name": "Đồ Lót & AIRism",
    "slug": "do-lot-airism",
    "gender": "unisex",
    "imageUrl": "https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg",
    "itemCount": 38
  },
  {
    "id": "cat-accessories",
    "name": "Phụ Kiện",
    "slug": "phu-kien",
    "gender": "unisex",
    "imageUrl": "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
    "itemCount": 22
  }
];

export const MOCK_REVIEWS_DEFAULT: ReviewItem[] = [
  {
    id: 'rev-01',
    author: 'Minh Trang N.',
    rating: 5,
    date: '14/10/2026',
    sizeBought: 'Size M - 09 BLACK',
    fitAssessment: 'Vừa vặn hoàn hảo',
    comment: 'Chất vải cực kỳ mịn và đẹp, đúng chuẩn Uniqlo LifeWear. Mình đã dùng tính năng Thử đồ AI để xem trước dáng áo, nhận về mặc vừa in y hệt hình AI mô phỏng!'
  },
  {
    id: 'rev-02',
    author: 'Đức Anh Lê',
    rating: 5,
    date: '10/10/2026',
    sizeBought: 'Size L - 57 OLIVE',
    fitAssessment: 'Vừa vặn hoàn hảo',
    comment: 'Đường may rất chắc chắn, màu sắc bên ngoài trầm đẹp hơn trên ảnh web. Rất thích tính năng xem đồ bằng AI vì đỡ phải đi lại đổi size.'
  },
  {
    id: 'rev-03',
    author: 'Khánh Vy',
    rating: 4,
    date: '02/10/2026',
    sizeBought: 'Size S - 01 OFF WHITE',
    fitAssessment: 'Hơi rộng',
    comment: 'Form áo hơi relaxed fit một chút, ai thích mặc ôm nên lùi 1 size. Tuy nhiên vải cotton sờ rất sướng tay.'
  }
];

export const MOCK_PRODUCTS: Product[] = [
{
  "id": "prod-001",
  "name": "Áo Cardigan Vải Gân Cổ V | Flower",
  "slug": "ao-cardigan-vai-gan-co-v-flower-489399",
  "description": "Áo Cardigan Vải Gân Cổ V | Flower theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 391000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-489399-69-S",
      "sku": "UQ-489399-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750"
    },
    {
      "id": "v-489399-69-M",
      "sku": "UQ-489399-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750"
    },
    {
      "id": "v-489399-69-L",
      "sku": "UQ-489399-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750"
    },
    {
      "id": "v-489399-69-XL",
      "sku": "UQ-489399-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750"
    },
    {
      "id": "v-489399-01-S",
      "sku": "UQ-489399-01-S",
      "size": "S",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750"
    },
    {
      "id": "v-489399-01-M",
      "sku": "UQ-489399-01-M",
      "size": "M",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750"
    },
    {
      "id": "v-489399-01-L",
      "sku": "UQ-489399-01-L",
      "size": "L",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750"
    },
    {
      "id": "v-489399-01-XL",
      "sku": "UQ-489399-01-XL",
      "size": "XL",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "489399",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_69_489399_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489399/item/vngoods_01_489399_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-489399-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-489399-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-825412",
  "name": "Bộ Sưu Tập Áo Khoác Casual",
  "slug": "bo-suu-tap-ao-khoac-casual-825412",
  "description": "Bộ Sưu Tập Áo Khoác Casual theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 611250,
  "thumbnailUrl": "https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg",
  "images": [
    "https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res9b5e278f97b517d36e3f1b5ed7e37d6efr.png"
  ],
  "variants": [
    {
      "id": "v-825412-09-S",
      "sku": "UQ-825412-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 37,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg"
    },
    {
      "id": "v-825412-09-M",
      "sku": "UQ-825412-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg"
    },
    {
      "id": "v-825412-09-L",
      "sku": "UQ-825412-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg"
    },
    {
      "id": "v-825412-09-XL",
      "sku": "UQ-825412-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "825412",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://im.uniqlo.com/global-cms/spa/res0163d1c2b3236d8ec89f660d80aac7a4fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res9b5e278f97b517d36e3f1b5ed7e37d6efr.png"
  ],
  "reviews": [
    {
      "id": "rev-825412-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-825412-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-485671",
  "name": "Áo Parka Chống Tia UV Bỏ Túi | NANO Design",
  "slug": "ao-parka-chong-tia-uv-bo-tui-nano-design-485671",
  "description": "Áo Parka Chống Tia UV Bỏ Túi | NANO Design tích hợp công nghệ chống nắng UPF 50+ ngăn chặn 90% tia UV độc hại, bề mặt phủ Nano trượt nước bền bỉ. Tiện lợi bỏ túi nhỏ gọn mang theo hàng ngày.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 980000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-485671-19-S",
      "sku": "UQ-485671-19-S",
      "size": "S",
      "color": "19 BURGUNDY",
      "colorCode": "19",
      "colorHex": "#4c0519",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750"
    },
    {
      "id": "v-485671-19-M",
      "sku": "UQ-485671-19-M",
      "size": "M",
      "color": "19 BURGUNDY",
      "colorCode": "19",
      "colorHex": "#4c0519",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750"
    },
    {
      "id": "v-485671-19-L",
      "sku": "UQ-485671-19-L",
      "size": "L",
      "color": "19 BURGUNDY",
      "colorCode": "19",
      "colorHex": "#4c0519",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750"
    },
    {
      "id": "v-485671-19-XL",
      "sku": "UQ-485671-19-XL",
      "size": "XL",
      "color": "19 BURGUNDY",
      "colorCode": "19",
      "colorHex": "#4c0519",
      "stockQuantity": 51,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "485671",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/485671/item/vngoods_19_485671_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-485671-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 19 BURGUNDY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-485671-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-488785",
  "name": "Áo Khoác Kéo Khóa Dáng Ngắn",
  "slug": "ao-khoac-keo-khoa-dang-ngan-488785",
  "description": "Áo Khoác Kéo Khóa Dáng Ngắn theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/sub/vngoods_488785_sub6_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-488785-34-S",
      "sku": "UQ-488785-34-S",
      "size": "S",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750"
    },
    {
      "id": "v-488785-34-M",
      "sku": "UQ-488785-34-M",
      "size": "M",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750"
    },
    {
      "id": "v-488785-34-L",
      "sku": "UQ-488785-34-L",
      "size": "L",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750"
    },
    {
      "id": "v-488785-34-XL",
      "sku": "UQ-488785-34-XL",
      "size": "XL",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "488785",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/item/vngoods_34_488785_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488785/sub/vngoods_488785_sub6_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-488785-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 34 BROWN",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-488785-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-469871",
  "name": "PUFFTECH Áo Khoác Chần Bông | Có Mũ",
  "slug": "pufftech-ao-khoac-chan-bong-co-mu-469871",
  "description": "PUFFTECH Áo Khoác Chần Bông | Có Mũ ứng dụng công nghệ sợi bông rỗng PUFFTECH độc quyền, giữ nhiệt tương đương lông vũ tự nhiên nhưng nhẹ hơn và kháng ẩm tuyệt đối. Dễ dàng gấp gọn mang theo mọi hành trình.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 2085000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-469871-06-S",
      "sku": "UQ-469871-06-S",
      "size": "S",
      "color": "06 GRAY",
      "colorCode": "06",
      "colorHex": "#475569",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750"
    },
    {
      "id": "v-469871-06-M",
      "sku": "UQ-469871-06-M",
      "size": "M",
      "color": "06 GRAY",
      "colorCode": "06",
      "colorHex": "#475569",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750"
    },
    {
      "id": "v-469871-06-L",
      "sku": "UQ-469871-06-L",
      "size": "L",
      "color": "06 GRAY",
      "colorCode": "06",
      "colorHex": "#475569",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750"
    },
    {
      "id": "v-469871-06-XL",
      "sku": "UQ-469871-06-XL",
      "size": "XL",
      "color": "06 GRAY",
      "colorCode": "06",
      "colorHex": "#475569",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "469871",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/469871/item/vngoods_06_469871_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-469871-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 06 GRAY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-469871-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-465203",
  "name": "DRY-EX Áo Hoodie Chống Tia UV Kéo Khóa",
  "slug": "dry-ex-ao-hoodie-chong-tia-uv-keo-khoa-465203",
  "description": "DRY-EX Áo Hoodie Chống Tia UV Kéo Khóa tích hợp công nghệ chống nắng UPF 50+ ngăn chặn 90% tia UV độc hại, bề mặt phủ Nano trượt nước bền bỉ. Tiện lợi bỏ túi nhỏ gọn mang theo hàng ngày.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 588000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-465203-18-S",
      "sku": "UQ-465203-18-S",
      "size": "S",
      "color": "18 WINE",
      "colorCode": "18",
      "colorHex": "#881337",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750"
    },
    {
      "id": "v-465203-18-M",
      "sku": "UQ-465203-18-M",
      "size": "M",
      "color": "18 WINE",
      "colorCode": "18",
      "colorHex": "#881337",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750"
    },
    {
      "id": "v-465203-18-L",
      "sku": "UQ-465203-18-L",
      "size": "L",
      "color": "18 WINE",
      "colorCode": "18",
      "colorHex": "#881337",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750"
    },
    {
      "id": "v-465203-18-XL",
      "sku": "UQ-465203-18-XL",
      "size": "XL",
      "color": "18 WINE",
      "colorCode": "18",
      "colorHex": "#881337",
      "stockQuantity": 46,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750"
    },
    {
      "id": "v-465203-57-S",
      "sku": "UQ-465203-57-S",
      "size": "S",
      "color": "57 OLIVE",
      "colorCode": "57",
      "colorHex": "#4d5d53",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750"
    },
    {
      "id": "v-465203-57-M",
      "sku": "UQ-465203-57-M",
      "size": "M",
      "color": "57 OLIVE",
      "colorCode": "57",
      "colorHex": "#4d5d53",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750"
    },
    {
      "id": "v-465203-57-L",
      "sku": "UQ-465203-57-L",
      "size": "L",
      "color": "57 OLIVE",
      "colorCode": "57",
      "colorHex": "#4d5d53",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750"
    },
    {
      "id": "v-465203-57-XL",
      "sku": "UQ-465203-57-XL",
      "size": "XL",
      "color": "57 OLIVE",
      "colorCode": "57",
      "colorHex": "#4d5d53",
      "stockQuantity": 46,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.9,
  "reviewCount": 999,
  "productCode": "465203",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_18_465203_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465203/item/vngoods_57_465203_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-465203-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 18 WINE",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-465203-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-487324",
  "name": "Áo Khoác Hai Mặt",
  "slug": "ao-khoac-hai-mat-487324",
  "description": "Áo Khoác Hai Mặt theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-487324-09-S",
      "sku": "UQ-487324-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750"
    },
    {
      "id": "v-487324-09-M",
      "sku": "UQ-487324-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750"
    },
    {
      "id": "v-487324-09-L",
      "sku": "UQ-487324-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 33,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750"
    },
    {
      "id": "v-487324-09-XL",
      "sku": "UQ-487324-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 38,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.7,
  "reviewCount": 15,
  "productCode": "487324",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487324/item/vngoods_09_487324_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-487324-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-487324-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-470118",
  "name": "PUFFTECH Áo Khoác Chần Bông | Có Mũ",
  "slug": "pufftech-ao-khoac-chan-bong-co-mu-470118",
  "description": "PUFFTECH Áo Khoác Chần Bông | Có Mũ ứng dụng công nghệ sợi bông rỗng PUFFTECH độc quyền, giữ nhiệt tương đương lông vũ tự nhiên nhưng nhẹ hơn và kháng ẩm tuyệt đối. Dễ dàng gấp gọn mang theo mọi hành trình.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 2085000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-470118-69-S",
      "sku": "UQ-470118-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750"
    },
    {
      "id": "v-470118-69-M",
      "sku": "UQ-470118-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 37,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750"
    },
    {
      "id": "v-470118-69-L",
      "sku": "UQ-470118-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750"
    },
    {
      "id": "v-470118-69-XL",
      "sku": "UQ-470118-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750"
    },
    {
      "id": "v-470118-59-S",
      "sku": "UQ-470118-59-S",
      "size": "S",
      "color": "59 DARK GREEN",
      "colorCode": "59",
      "colorHex": "#14532d",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750"
    },
    {
      "id": "v-470118-59-M",
      "sku": "UQ-470118-59-M",
      "size": "M",
      "color": "59 DARK GREEN",
      "colorCode": "59",
      "colorHex": "#14532d",
      "stockQuantity": 37,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750"
    },
    {
      "id": "v-470118-59-L",
      "sku": "UQ-470118-59-L",
      "size": "L",
      "color": "59 DARK GREEN",
      "colorCode": "59",
      "colorHex": "#14532d",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750"
    },
    {
      "id": "v-470118-59-XL",
      "sku": "UQ-470118-59-XL",
      "size": "XL",
      "color": "59 DARK GREEN",
      "colorCode": "59",
      "colorHex": "#14532d",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.8,
  "reviewCount": 481,
  "productCode": "470118",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118/item/vngoods_69_470118_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/470118001/item/vngoods_59_470118001_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-470118-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-470118-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-486816",
  "name": "Áo Khoác Đa Năng",
  "slug": "ao-khoac-da-nang-486816",
  "description": "Áo Khoác Đa Năng theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 1471000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-486816-09-S",
      "sku": "UQ-486816-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750"
    },
    {
      "id": "v-486816-09-M",
      "sku": "UQ-486816-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750"
    },
    {
      "id": "v-486816-09-L",
      "sku": "UQ-486816-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750"
    },
    {
      "id": "v-486816-09-XL",
      "sku": "UQ-486816-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 48,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 5.0,
  "reviewCount": 2,
  "productCode": "486816",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486816/item/vngoods_09_486816_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-486816-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-486816-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-484610",
  "name": "Áo Khoác Harrington",
  "slug": "ao-khoac-harrington-484610",
  "description": "Áo Khoác Harrington theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-jackets",
  "categoryName": "Áo Khoác",
  "basePrice": 1593750,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-484610-38-S",
      "sku": "UQ-484610-38-S",
      "size": "S",
      "color": "38 DARK BROWN",
      "colorCode": "38",
      "colorHex": "#451a03",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750"
    },
    {
      "id": "v-484610-38-M",
      "sku": "UQ-484610-38-M",
      "size": "M",
      "color": "38 DARK BROWN",
      "colorCode": "38",
      "colorHex": "#451a03",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750"
    },
    {
      "id": "v-484610-38-L",
      "sku": "UQ-484610-38-L",
      "size": "L",
      "color": "38 DARK BROWN",
      "colorCode": "38",
      "colorHex": "#451a03",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750"
    },
    {
      "id": "v-484610-38-XL",
      "sku": "UQ-484610-38-XL",
      "size": "XL",
      "color": "38 DARK BROWN",
      "colorCode": "38",
      "colorHex": "#451a03",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.9,
  "reviewCount": 304,
  "productCode": "484610",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484610/item/vngoods_38_484610_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-484610-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 38 DARK BROWN",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-484610-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-487594",
  "name": "Áo Khoác Phối Lót Lông Giả Lông Cừu",
  "slug": "ao-khoac-phoi-lot-long-gia-long-cuu-487594",
  "description": "Áo Khoác Phối Lót Lông Giả Lông Cừu sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.",
  "categoryId": "cat-fleece",
  "categoryName": "Áo Lông Cừu",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_09_487594_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_18_487594_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-487594-01-S",
      "sku": "UQ-487594-01-S",
      "size": "S",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-01-M",
      "sku": "UQ-487594-01-M",
      "size": "M",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-01-L",
      "sku": "UQ-487594-01-L",
      "size": "L",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-01-XL",
      "sku": "UQ-487594-01-XL",
      "size": "XL",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-69-S",
      "sku": "UQ-487594-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-69-M",
      "sku": "UQ-487594-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-69-L",
      "sku": "UQ-487594-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-69-XL",
      "sku": "UQ-487594-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-09-S",
      "sku": "UQ-487594-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_09_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-09-M",
      "sku": "UQ-487594-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_09_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-09-L",
      "sku": "UQ-487594-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_09_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-09-XL",
      "sku": "UQ-487594-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_09_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-18-S",
      "sku": "UQ-487594-18-S",
      "size": "S",
      "color": "18 WINE",
      "colorCode": "18",
      "colorHex": "#881337",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_18_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-18-M",
      "sku": "UQ-487594-18-M",
      "size": "M",
      "color": "18 WINE",
      "colorCode": "18",
      "colorHex": "#881337",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_18_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-18-L",
      "sku": "UQ-487594-18-L",
      "size": "L",
      "color": "18 WINE",
      "colorCode": "18",
      "colorHex": "#881337",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_18_487594_3x4.jpg?width=750"
    },
    {
      "id": "v-487594-18-XL",
      "sku": "UQ-487594-18-XL",
      "size": "XL",
      "color": "18 WINE",
      "colorCode": "18",
      "colorHex": "#881337",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_18_487594_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "487594",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_01_487594_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_69_487594_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487594/item/vngoods_09_487594_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-487594-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 01 OFF WHITE",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-487594-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-912812",
  "name": "Bộ Sưu Tập Áo Giả Lông Cừu",
  "slug": "bo-suu-tap-ao-gia-long-cuu-912812",
  "description": "Bộ Sưu Tập Áo Giả Lông Cừu sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.",
  "categoryId": "cat-fleece",
  "categoryName": "Áo Lông Cừu",
  "basePrice": 611250,
  "thumbnailUrl": "https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg",
  "images": [
    "https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res6b140d24af8cf15fc70327f69873b9e5fr.png"
  ],
  "variants": [
    {
      "id": "v-912812-09-S",
      "sku": "UQ-912812-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg"
    },
    {
      "id": "v-912812-09-M",
      "sku": "UQ-912812-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg"
    },
    {
      "id": "v-912812-09-L",
      "sku": "UQ-912812-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg"
    },
    {
      "id": "v-912812-09-XL",
      "sku": "UQ-912812-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg"
    }
  ],
  "inStock": true,
  "featured": true,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "912812",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://im.uniqlo.com/global-cms/spa/resca00dbd0bbb16c83cd729854442cff37fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res6b140d24af8cf15fc70327f69873b9e5fr.png"
  ],
  "reviews": [
    {
      "id": "rev-912812-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-912812-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-486116",
  "name": "Áo Khoác Giả Lông Cừu Cản Gió Kéo Khóa",
  "slug": "ao-khoac-gia-long-cuu-can-gio-keo-khoa-486116",
  "description": "Áo Khoác Giả Lông Cừu Cản Gió Kéo Khóa sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.",
  "categoryId": "cat-fleece",
  "categoryName": "Áo Lông Cừu",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-486116-69-S",
      "sku": "UQ-486116-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 33,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750"
    },
    {
      "id": "v-486116-69-M",
      "sku": "UQ-486116-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750"
    },
    {
      "id": "v-486116-69-L",
      "sku": "UQ-486116-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 38,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750"
    },
    {
      "id": "v-486116-69-XL",
      "sku": "UQ-486116-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.9,
  "reviewCount": 22,
  "productCode": "486116",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486116/item/vngoods_69_486116_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-486116-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-486116-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-489487",
  "name": "Áo Khoác Blouson Giả Lông Cừu Kéo Khóa",
  "slug": "ao-khoac-blouson-gia-long-cuu-keo-khoa-489487",
  "description": "Áo Khoác Blouson Giả Lông Cừu Kéo Khóa sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.",
  "categoryId": "cat-fleece",
  "categoryName": "Áo Lông Cừu",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-489487-16-S",
      "sku": "UQ-489487-16-S",
      "size": "S",
      "color": "16 COLOR",
      "colorCode": "16",
      "colorHex": "#6b7280",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750"
    },
    {
      "id": "v-489487-16-M",
      "sku": "UQ-489487-16-M",
      "size": "M",
      "color": "16 COLOR",
      "colorCode": "16",
      "colorHex": "#6b7280",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750"
    },
    {
      "id": "v-489487-16-L",
      "sku": "UQ-489487-16-L",
      "size": "L",
      "color": "16 COLOR",
      "colorCode": "16",
      "colorHex": "#6b7280",
      "stockQuantity": 46,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750"
    },
    {
      "id": "v-489487-16-XL",
      "sku": "UQ-489487-16-XL",
      "size": "XL",
      "color": "16 COLOR",
      "colorCode": "16",
      "colorHex": "#6b7280",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 5.0,
  "reviewCount": 2,
  "productCode": "489487",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489487/item/vngoods_16_489487_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-489487-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 16 COLOR",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-489487-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-488747",
  "name": "Áo Khoác Blouson Giả Lông Cừu Kéo Khóa",
  "slug": "ao-khoac-blouson-gia-long-cuu-keo-khoa-488747",
  "description": "Áo Khoác Blouson Giả Lông Cừu Kéo Khóa sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.",
  "categoryId": "cat-fleece",
  "categoryName": "Áo Lông Cừu",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-488747-32-S",
      "sku": "UQ-488747-32-S",
      "size": "S",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750"
    },
    {
      "id": "v-488747-32-M",
      "sku": "UQ-488747-32-M",
      "size": "M",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750"
    },
    {
      "id": "v-488747-32-L",
      "sku": "UQ-488747-32-L",
      "size": "L",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750"
    },
    {
      "id": "v-488747-32-XL",
      "sku": "UQ-488747-32-XL",
      "size": "XL",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "488747",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488747/item/vngoods_32_488747_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-488747-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 32 BEIGE",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-488747-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-488774",
  "name": "Áo Khoác Cản Gió Giả Lông Cừu",
  "slug": "ao-khoac-can-gio-gia-long-cuu-488774",
  "description": "Áo Khoác Cản Gió Giả Lông Cừu sử dụng sợi vải giả lông cừu Fleece thế hệ mới, giữ ấm vượt trội, kết cấu xốp mịn êm dịu và siêu nhẹ. Thiết kế cổ đứng cản gió phong cách LifeWear, bo viền co giãn ôm trọn cơ thể.",
  "categoryId": "cat-fleece",
  "categoryName": "Áo Lông Cừu",
  "basePrice": 1593750,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-488774-09-S",
      "sku": "UQ-488774-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750"
    },
    {
      "id": "v-488774-09-M",
      "sku": "UQ-488774-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750"
    },
    {
      "id": "v-488774-09-L",
      "sku": "UQ-488774-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750"
    },
    {
      "id": "v-488774-09-XL",
      "sku": "UQ-488774-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "488774",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488774/item/vngoods_09_488774_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-488774-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-488774-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-252255",
  "name": "Bộ Sưu Tập Quần Jeans",
  "slug": "bo-suu-tap-quan-jeans-252255",
  "description": "Bộ Sưu Tập Quần Jeans được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.",
  "categoryId": "cat-jeans",
  "categoryName": "Quần Jeans",
  "basePrice": 611250,
  "thumbnailUrl": "https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg",
  "images": [
    "https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res2584c30164f316c72c73e7cde2bc23d5fr.png"
  ],
  "variants": [
    {
      "id": "v-252255-09-28",
      "sku": "UQ-252255-09-28",
      "size": "28",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg"
    },
    {
      "id": "v-252255-09-29",
      "sku": "UQ-252255-09-29",
      "size": "29",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg"
    },
    {
      "id": "v-252255-09-30",
      "sku": "UQ-252255-09-30",
      "size": "30",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg"
    },
    {
      "id": "v-252255-09-31",
      "sku": "UQ-252255-09-31",
      "size": "31",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg"
    },
    {
      "id": "v-252255-09-32",
      "sku": "UQ-252255-09-32",
      "size": "32",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 38,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "252255",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://im.uniqlo.com/global-cms/spa/res1c2cabcbd404f569d144443c0f5de217fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res2584c30164f316c72c73e7cde2bc23d5fr.png"
  ],
  "reviews": [
    {
      "id": "rev-252255-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-252255-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-477335",
  "name": "Quần Jeans Ống Suông",
  "slug": "quan-jeans-ong-suong-477335",
  "description": "Quần Jeans Ống Suông được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.",
  "categoryId": "cat-jeans",
  "categoryName": "Quần Jeans",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-477335-65-28",
      "sku": "UQ-477335-65-28",
      "size": "28",
      "color": "65 BLUE LIGHT",
      "colorCode": "65",
      "colorHex": "#60a5fa",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750"
    },
    {
      "id": "v-477335-65-29",
      "sku": "UQ-477335-65-29",
      "size": "29",
      "color": "65 BLUE LIGHT",
      "colorCode": "65",
      "colorHex": "#60a5fa",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750"
    },
    {
      "id": "v-477335-65-30",
      "sku": "UQ-477335-65-30",
      "size": "30",
      "color": "65 BLUE LIGHT",
      "colorCode": "65",
      "colorHex": "#60a5fa",
      "stockQuantity": 33,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750"
    },
    {
      "id": "v-477335-65-31",
      "sku": "UQ-477335-65-31",
      "size": "31",
      "color": "65 BLUE LIGHT",
      "colorCode": "65",
      "colorHex": "#60a5fa",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750"
    },
    {
      "id": "v-477335-65-32",
      "sku": "UQ-477335-65-32",
      "size": "32",
      "color": "65 BLUE LIGHT",
      "colorCode": "65",
      "colorHex": "#60a5fa",
      "stockQuantity": 31,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "477335",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477335/item/vngoods_65_477335_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-477335-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 65 BLUE LIGHT",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-477335-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-482281",
  "name": "Quần Jeans EZY Dáng Rộng Ống Suông",
  "slug": "quan-jeans-ezy-dang-rong-ong-suong-482281",
  "description": "Quần Jeans EZY Dáng Rộng Ống Suông được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.",
  "categoryId": "cat-jeans",
  "categoryName": "Quần Jeans",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-482281-07-28",
      "sku": "UQ-482281-07-28",
      "size": "28",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750"
    },
    {
      "id": "v-482281-07-29",
      "sku": "UQ-482281-07-29",
      "size": "29",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 33,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750"
    },
    {
      "id": "v-482281-07-30",
      "sku": "UQ-482281-07-30",
      "size": "30",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 52,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750"
    },
    {
      "id": "v-482281-07-31",
      "sku": "UQ-482281-07-31",
      "size": "31",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750"
    },
    {
      "id": "v-482281-07-32",
      "sku": "UQ-482281-07-32",
      "size": "32",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 38,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "482281",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/482281/item/vngoods_07_482281_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-482281-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 07 GRAY BEIGE",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-482281-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-480740",
  "name": "Quần Jeans Baggy Ống Cong Barrel",
  "slug": "quan-jeans-baggy-ong-cong-barrel-480740",
  "description": "Quần Jeans Baggy Ống Cong Barrel được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.",
  "categoryId": "cat-jeans",
  "categoryName": "Quần Jeans",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_04_480740_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_31_480740_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-480740-67-28",
      "sku": "UQ-480740-67-28",
      "size": "28",
      "color": "67 BLUE",
      "colorCode": "67",
      "colorHex": "#3b82f6",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-67-29",
      "sku": "UQ-480740-67-29",
      "size": "29",
      "color": "67 BLUE",
      "colorCode": "67",
      "colorHex": "#3b82f6",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-67-30",
      "sku": "UQ-480740-67-30",
      "size": "30",
      "color": "67 BLUE",
      "colorCode": "67",
      "colorHex": "#3b82f6",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-67-31",
      "sku": "UQ-480740-67-31",
      "size": "31",
      "color": "67 BLUE",
      "colorCode": "67",
      "colorHex": "#3b82f6",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-67-32",
      "sku": "UQ-480740-67-32",
      "size": "32",
      "color": "67 BLUE",
      "colorCode": "67",
      "colorHex": "#3b82f6",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-68-28",
      "sku": "UQ-480740-68-28",
      "size": "28",
      "color": "68 BLUE DARK",
      "colorCode": "68",
      "colorHex": "#1e3a8a",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-68-29",
      "sku": "UQ-480740-68-29",
      "size": "29",
      "color": "68 BLUE DARK",
      "colorCode": "68",
      "colorHex": "#1e3a8a",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-68-30",
      "sku": "UQ-480740-68-30",
      "size": "30",
      "color": "68 BLUE DARK",
      "colorCode": "68",
      "colorHex": "#1e3a8a",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-68-31",
      "sku": "UQ-480740-68-31",
      "size": "31",
      "color": "68 BLUE DARK",
      "colorCode": "68",
      "colorHex": "#1e3a8a",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-68-32",
      "sku": "UQ-480740-68-32",
      "size": "32",
      "color": "68 BLUE DARK",
      "colorCode": "68",
      "colorHex": "#1e3a8a",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-04-28",
      "sku": "UQ-480740-04-28",
      "size": "28",
      "color": "04 GRAY",
      "colorCode": "04",
      "colorHex": "#94a3b8",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_04_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-04-29",
      "sku": "UQ-480740-04-29",
      "size": "29",
      "color": "04 GRAY",
      "colorCode": "04",
      "colorHex": "#94a3b8",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_04_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-04-30",
      "sku": "UQ-480740-04-30",
      "size": "30",
      "color": "04 GRAY",
      "colorCode": "04",
      "colorHex": "#94a3b8",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_04_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-04-31",
      "sku": "UQ-480740-04-31",
      "size": "31",
      "color": "04 GRAY",
      "colorCode": "04",
      "colorHex": "#94a3b8",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_04_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-04-32",
      "sku": "UQ-480740-04-32",
      "size": "32",
      "color": "04 GRAY",
      "colorCode": "04",
      "colorHex": "#94a3b8",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_04_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-31-28",
      "sku": "UQ-480740-31-28",
      "size": "28",
      "color": "31 BEIGE",
      "colorCode": "31",
      "colorHex": "#e2d7c5",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_31_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-31-29",
      "sku": "UQ-480740-31-29",
      "size": "29",
      "color": "31 BEIGE",
      "colorCode": "31",
      "colorHex": "#e2d7c5",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_31_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-31-30",
      "sku": "UQ-480740-31-30",
      "size": "30",
      "color": "31 BEIGE",
      "colorCode": "31",
      "colorHex": "#e2d7c5",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_31_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-31-31",
      "sku": "UQ-480740-31-31",
      "size": "31",
      "color": "31 BEIGE",
      "colorCode": "31",
      "colorHex": "#e2d7c5",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_31_480740_3x4.jpg?width=750"
    },
    {
      "id": "v-480740-31-32",
      "sku": "UQ-480740-31-32",
      "size": "32",
      "color": "31 BEIGE",
      "colorCode": "31",
      "colorHex": "#e2d7c5",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_31_480740_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "480740",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_67_480740_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_68_480740_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/480740/item/vngoods_04_480740_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-480740-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 67 BLUE",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-480740-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-484808",
  "name": "Quần Jeans Baggy Ống Cong Barrel",
  "slug": "quan-jeans-baggy-ong-cong-barrel-484808",
  "description": "Quần Jeans Baggy Ống Cong Barrel được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.",
  "categoryId": "cat-jeans",
  "categoryName": "Quần Jeans",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-484808-64-28",
      "sku": "UQ-484808-64-28",
      "size": "28",
      "color": "64 COLOR",
      "colorCode": "64",
      "colorHex": "#6b7280",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750"
    },
    {
      "id": "v-484808-64-29",
      "sku": "UQ-484808-64-29",
      "size": "29",
      "color": "64 COLOR",
      "colorCode": "64",
      "colorHex": "#6b7280",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750"
    },
    {
      "id": "v-484808-64-30",
      "sku": "UQ-484808-64-30",
      "size": "30",
      "color": "64 COLOR",
      "colorCode": "64",
      "colorHex": "#6b7280",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750"
    },
    {
      "id": "v-484808-64-31",
      "sku": "UQ-484808-64-31",
      "size": "31",
      "color": "64 COLOR",
      "colorCode": "64",
      "colorHex": "#6b7280",
      "stockQuantity": 46,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750"
    },
    {
      "id": "v-484808-64-32",
      "sku": "UQ-484808-64-32",
      "size": "32",
      "color": "64 COLOR",
      "colorCode": "64",
      "colorHex": "#6b7280",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.9,
  "reviewCount": 228,
  "productCode": "484808",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484808/item/vngoods_64_484808_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-484808-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 64 COLOR",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-484808-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-487207",
  "name": "Quần Jeans Ống Barrel | Nhung Gân",
  "slug": "quan-jeans-ong-barrel-nhung-gan-487207",
  "description": "Quần Jeans Ống Barrel | Nhung Gân được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.",
  "categoryId": "cat-jeans",
  "categoryName": "Quần Jeans",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-487207-09-28",
      "sku": "UQ-487207-09-28",
      "size": "28",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750"
    },
    {
      "id": "v-487207-09-29",
      "sku": "UQ-487207-09-29",
      "size": "29",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750"
    },
    {
      "id": "v-487207-09-30",
      "sku": "UQ-487207-09-30",
      "size": "30",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750"
    },
    {
      "id": "v-487207-09-31",
      "sku": "UQ-487207-09-31",
      "size": "31",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750"
    },
    {
      "id": "v-487207-09-32",
      "sku": "UQ-487207-09-32",
      "size": "32",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750"
    },
    {
      "id": "v-487207-34-28",
      "sku": "UQ-487207-34-28",
      "size": "28",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750"
    },
    {
      "id": "v-487207-34-29",
      "sku": "UQ-487207-34-29",
      "size": "29",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750"
    },
    {
      "id": "v-487207-34-30",
      "sku": "UQ-487207-34-30",
      "size": "30",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750"
    },
    {
      "id": "v-487207-34-31",
      "sku": "UQ-487207-34-31",
      "size": "31",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750"
    },
    {
      "id": "v-487207-34-32",
      "sku": "UQ-487207-34-32",
      "size": "32",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "487207",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_09_487207_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487207/item/vngoods_34_487207_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-487207-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-487207-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-488630",
  "name": "Quần Jeans EZY Ống Cong Barrel​",
  "slug": "quan-jeans-ezy-ong-cong-barrel-488630",
  "description": "Quần Jeans EZY Ống Cong Barrel​ được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.",
  "categoryId": "cat-jeans",
  "categoryName": "Quần Jeans",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-488630-66-28",
      "sku": "UQ-488630-66-28",
      "size": "28",
      "color": "66 COLOR",
      "colorCode": "66",
      "colorHex": "#6b7280",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750"
    },
    {
      "id": "v-488630-66-29",
      "sku": "UQ-488630-66-29",
      "size": "29",
      "color": "66 COLOR",
      "colorCode": "66",
      "colorHex": "#6b7280",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750"
    },
    {
      "id": "v-488630-66-30",
      "sku": "UQ-488630-66-30",
      "size": "30",
      "color": "66 COLOR",
      "colorCode": "66",
      "colorHex": "#6b7280",
      "stockQuantity": 37,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750"
    },
    {
      "id": "v-488630-66-31",
      "sku": "UQ-488630-66-31",
      "size": "31",
      "color": "66 COLOR",
      "colorCode": "66",
      "colorHex": "#6b7280",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750"
    },
    {
      "id": "v-488630-66-32",
      "sku": "UQ-488630-66-32",
      "size": "32",
      "color": "66 COLOR",
      "colorCode": "66",
      "colorHex": "#6b7280",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 98,
  "productCode": "488630",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488630/item/vngoods_66_488630_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-488630-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 66 COLOR",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-488630-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-488743",
  "name": "Quần Jeans Ống Cong Barrel​",
  "slug": "quan-jeans-ong-cong-barrel-488743",
  "description": "Quần Jeans Ống Cong Barrel​ được dệt từ 100% sợi bông denim Kaihara Nhật Bản thượng hạng, áp dụng kỹ thuật wash sinh thái tiết kiệm nước. Phom dáng suông rộng thời thượng, tôn chiều dài đôi chân.",
  "categoryId": "cat-jeans",
  "categoryName": "Quần Jeans",
  "basePrice": 1225000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-488743-69-28",
      "sku": "UQ-488743-69-28",
      "size": "28",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750"
    },
    {
      "id": "v-488743-69-29",
      "sku": "UQ-488743-69-29",
      "size": "29",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750"
    },
    {
      "id": "v-488743-69-30",
      "sku": "UQ-488743-69-30",
      "size": "30",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750"
    },
    {
      "id": "v-488743-69-31",
      "sku": "UQ-488743-69-31",
      "size": "31",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750"
    },
    {
      "id": "v-488743-69-32",
      "sku": "UQ-488743-69-32",
      "size": "32",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.9,
  "reviewCount": 85,
  "productCode": "488743",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488743/item/vngoods_69_488743_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-488743-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-488743-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-486317",
  "name": "Quần Easy Ống Rộng Vải Gân",
  "slug": "quan-easy-ong-rong-vai-gan-486317",
  "description": "Quần Easy Ống Rộng Vải Gân sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.",
  "categoryId": "cat-pants",
  "categoryName": "Quần Dài",
  "basePrice": 588000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-486317-03-28",
      "sku": "UQ-486317-03-28",
      "size": "28",
      "color": "03 GRAY",
      "colorCode": "03",
      "colorHex": "#cbd5e1",
      "stockQuantity": 51,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750"
    },
    {
      "id": "v-486317-03-29",
      "sku": "UQ-486317-03-29",
      "size": "29",
      "color": "03 GRAY",
      "colorCode": "03",
      "colorHex": "#cbd5e1",
      "stockQuantity": 48,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750"
    },
    {
      "id": "v-486317-03-30",
      "sku": "UQ-486317-03-30",
      "size": "30",
      "color": "03 GRAY",
      "colorCode": "03",
      "colorHex": "#cbd5e1",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750"
    },
    {
      "id": "v-486317-03-31",
      "sku": "UQ-486317-03-31",
      "size": "31",
      "color": "03 GRAY",
      "colorCode": "03",
      "colorHex": "#cbd5e1",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750"
    },
    {
      "id": "v-486317-03-32",
      "sku": "UQ-486317-03-32",
      "size": "32",
      "color": "03 GRAY",
      "colorCode": "03",
      "colorHex": "#cbd5e1",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750"
    },
    {
      "id": "v-486317-09-28",
      "sku": "UQ-486317-09-28",
      "size": "28",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 51,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750"
    },
    {
      "id": "v-486317-09-29",
      "sku": "UQ-486317-09-29",
      "size": "29",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 48,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750"
    },
    {
      "id": "v-486317-09-30",
      "sku": "UQ-486317-09-30",
      "size": "30",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750"
    },
    {
      "id": "v-486317-09-31",
      "sku": "UQ-486317-09-31",
      "size": "31",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750"
    },
    {
      "id": "v-486317-09-32",
      "sku": "UQ-486317-09-32",
      "size": "32",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "486317",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_03_486317_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/486317/item/vngoods_09_486317_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-486317-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 03 GRAY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-486317-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-2825",
  "name": "Áo Thun Vải Gân Có Mũ",
  "slug": "ao-thun-vai-gan-co-mu-2825",
  "description": "Áo Thun Vải Gân Có Mũ sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.",
  "categoryId": "cat-pants",
  "categoryName": "Quần Dài",
  "basePrice": 488750,
  "thumbnailUrl": "https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg",
  "images": [
    "https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg",
    "https://im.uniqlo.com/global-cms/spa/resdabe40c52737561c55df4dad73f278e5fr.png"
  ],
  "variants": [
    {
      "id": "v-2825-09-S",
      "sku": "UQ-2825-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 46,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg"
    },
    {
      "id": "v-2825-09-M",
      "sku": "UQ-2825-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg"
    },
    {
      "id": "v-2825-09-L",
      "sku": "UQ-2825-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg"
    },
    {
      "id": "v-2825-09-XL",
      "sku": "UQ-2825-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "2825",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg",
    "https://im.uniqlo.com/global-cms/spa/resdabe40c52737561c55df4dad73f278e5fr.png"
  ],
  "reviews": [
    {
      "id": "rev-2825-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-2825-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-233741",
  "name": "Quần Easy Ống Rộng Vải Gân",
  "slug": "quan-easy-ong-rong-vai-gan-233741",
  "description": "Quần Easy Ống Rộng Vải Gân sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.",
  "categoryId": "cat-pants",
  "categoryName": "Quần Dài",
  "basePrice": 588000,
  "thumbnailUrl": "https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg",
  "images": [
    "https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res3e8070eb2833a3c47ef137c82d3c083afr.png"
  ],
  "variants": [
    {
      "id": "v-233741-09-28",
      "sku": "UQ-233741-09-28",
      "size": "28",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg"
    },
    {
      "id": "v-233741-09-29",
      "sku": "UQ-233741-09-29",
      "size": "29",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg"
    },
    {
      "id": "v-233741-09-30",
      "sku": "UQ-233741-09-30",
      "size": "30",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg"
    },
    {
      "id": "v-233741-09-31",
      "sku": "UQ-233741-09-31",
      "size": "31",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 46,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg"
    },
    {
      "id": "v-233741-09-32",
      "sku": "UQ-233741-09-32",
      "size": "32",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 48,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "233741",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://im.uniqlo.com/global-cms/spa/res8bb2c8eb5368a3d102b274d9d25fab27fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res3e8070eb2833a3c47ef137c82d3c083afr.png"
  ],
  "reviews": [
    {
      "id": "rev-233741-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-233741-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-487837",
  "name": "Quần Culottes Vải Denim Dáng Rũ",
  "slug": "quan-culottes-vai-denim-dang-ru-487837",
  "description": "Quần Culottes Vải Denim Dáng Rũ sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.",
  "categoryId": "cat-pants",
  "categoryName": "Quần Dài",
  "basePrice": 784000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-487837-69-28",
      "sku": "UQ-487837-69-28",
      "size": "28",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 33,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750"
    },
    {
      "id": "v-487837-69-29",
      "sku": "UQ-487837-69-29",
      "size": "29",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750"
    },
    {
      "id": "v-487837-69-30",
      "sku": "UQ-487837-69-30",
      "size": "30",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750"
    },
    {
      "id": "v-487837-69-31",
      "sku": "UQ-487837-69-31",
      "size": "31",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750"
    },
    {
      "id": "v-487837-69-32",
      "sku": "UQ-487837-69-32",
      "size": "32",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "487837",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487837/item/vngoods_69_487837_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-487837-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-487837-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-487214",
  "name": "Quần Chino Dáng Barrel",
  "slug": "quan-chino-dang-barrel-487214",
  "description": "Quần Chino Dáng Barrel sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.",
  "categoryId": "cat-pants",
  "categoryName": "Quần Dài",
  "basePrice": 784000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-487214-07-28",
      "sku": "UQ-487214-07-28",
      "size": "28",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750"
    },
    {
      "id": "v-487214-07-29",
      "sku": "UQ-487214-07-29",
      "size": "29",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750"
    },
    {
      "id": "v-487214-07-30",
      "sku": "UQ-487214-07-30",
      "size": "30",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750"
    },
    {
      "id": "v-487214-07-31",
      "sku": "UQ-487214-07-31",
      "size": "31",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750"
    },
    {
      "id": "v-487214-07-32",
      "sku": "UQ-487214-07-32",
      "size": "32",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750"
    },
    {
      "id": "v-487214-09-28",
      "sku": "UQ-487214-09-28",
      "size": "28",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750"
    },
    {
      "id": "v-487214-09-29",
      "sku": "UQ-487214-09-29",
      "size": "29",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750"
    },
    {
      "id": "v-487214-09-30",
      "sku": "UQ-487214-09-30",
      "size": "30",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750"
    },
    {
      "id": "v-487214-09-31",
      "sku": "UQ-487214-09-31",
      "size": "31",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750"
    },
    {
      "id": "v-487214-09-32",
      "sku": "UQ-487214-09-32",
      "size": "32",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 5.0,
  "reviewCount": 8,
  "productCode": "487214",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_07_487214_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487214/item/vngoods_09_487214_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-487214-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 07 GRAY BEIGE",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-487214-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-484875",
  "name": "Quần Dài Ống Cong Barrel",
  "slug": "quan-dai-ong-cong-barrel-484875",
  "description": "Quần Dài Ống Cong Barrel sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.",
  "categoryId": "cat-pants",
  "categoryName": "Quần Dài",
  "basePrice": 980000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_01_484875_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_09_484875_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-484875-32-28",
      "sku": "UQ-484875-32-28",
      "size": "28",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-32-29",
      "sku": "UQ-484875-32-29",
      "size": "29",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-32-30",
      "sku": "UQ-484875-32-30",
      "size": "30",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-32-31",
      "sku": "UQ-484875-32-31",
      "size": "31",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-32-32",
      "sku": "UQ-484875-32-32",
      "size": "32",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-34-28",
      "sku": "UQ-484875-34-28",
      "size": "28",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-34-29",
      "sku": "UQ-484875-34-29",
      "size": "29",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-34-30",
      "sku": "UQ-484875-34-30",
      "size": "30",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-34-31",
      "sku": "UQ-484875-34-31",
      "size": "31",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-34-32",
      "sku": "UQ-484875-34-32",
      "size": "32",
      "color": "34 BROWN",
      "colorCode": "34",
      "colorHex": "#78350f",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-01-28",
      "sku": "UQ-484875-01-28",
      "size": "28",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_01_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-01-29",
      "sku": "UQ-484875-01-29",
      "size": "29",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_01_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-01-30",
      "sku": "UQ-484875-01-30",
      "size": "30",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_01_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-01-31",
      "sku": "UQ-484875-01-31",
      "size": "31",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_01_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-01-32",
      "sku": "UQ-484875-01-32",
      "size": "32",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_01_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-09-28",
      "sku": "UQ-484875-09-28",
      "size": "28",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_09_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-09-29",
      "sku": "UQ-484875-09-29",
      "size": "29",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_09_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-09-30",
      "sku": "UQ-484875-09-30",
      "size": "30",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_09_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-09-31",
      "sku": "UQ-484875-09-31",
      "size": "31",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_09_484875_3x4.jpg?width=750"
    },
    {
      "id": "v-484875-09-32",
      "sku": "UQ-484875-09-32",
      "size": "32",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_09_484875_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 730,
  "productCode": "484875",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_32_484875_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_34_484875_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/484875/item/vngoods_01_484875_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-484875-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 32 BEIGE",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-484875-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-488739",
  "name": "Quần Easy Co Giãn | Vải Jersey",
  "slug": "quan-easy-co-gian-vai-jersey-488739",
  "description": "Quần Easy Co Giãn | Vải Jersey sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.",
  "categoryId": "cat-pants",
  "categoryName": "Quần Dài",
  "basePrice": 588000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_09_488739_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_57_488739_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-488739-69-28",
      "sku": "UQ-488739-69-28",
      "size": "28",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-69-29",
      "sku": "UQ-488739-69-29",
      "size": "29",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-69-30",
      "sku": "UQ-488739-69-30",
      "size": "30",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-69-31",
      "sku": "UQ-488739-69-31",
      "size": "31",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-69-32",
      "sku": "UQ-488739-69-32",
      "size": "32",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-32-28",
      "sku": "UQ-488739-32-28",
      "size": "28",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-32-29",
      "sku": "UQ-488739-32-29",
      "size": "29",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-32-30",
      "sku": "UQ-488739-32-30",
      "size": "30",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-32-31",
      "sku": "UQ-488739-32-31",
      "size": "31",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-32-32",
      "sku": "UQ-488739-32-32",
      "size": "32",
      "color": "32 BEIGE",
      "colorCode": "32",
      "colorHex": "#d4b996",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-09-28",
      "sku": "UQ-488739-09-28",
      "size": "28",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_09_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-09-29",
      "sku": "UQ-488739-09-29",
      "size": "29",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_09_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-09-30",
      "sku": "UQ-488739-09-30",
      "size": "30",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_09_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-09-31",
      "sku": "UQ-488739-09-31",
      "size": "31",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_09_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-09-32",
      "sku": "UQ-488739-09-32",
      "size": "32",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_09_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-57-28",
      "sku": "UQ-488739-57-28",
      "size": "28",
      "color": "57 OLIVE",
      "colorCode": "57",
      "colorHex": "#4d5d53",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_57_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-57-29",
      "sku": "UQ-488739-57-29",
      "size": "29",
      "color": "57 OLIVE",
      "colorCode": "57",
      "colorHex": "#4d5d53",
      "stockQuantity": 54,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_57_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-57-30",
      "sku": "UQ-488739-57-30",
      "size": "30",
      "color": "57 OLIVE",
      "colorCode": "57",
      "colorHex": "#4d5d53",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_57_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-57-31",
      "sku": "UQ-488739-57-31",
      "size": "31",
      "color": "57 OLIVE",
      "colorCode": "57",
      "colorHex": "#4d5d53",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_57_488739_3x4.jpg?width=750"
    },
    {
      "id": "v-488739-57-32",
      "sku": "UQ-488739-57-32",
      "size": "32",
      "color": "57 OLIVE",
      "colorCode": "57",
      "colorHex": "#4d5d53",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_57_488739_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 220,
  "productCode": "488739",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_69_488739_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_32_488739_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488739/item/vngoods_09_488739_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-488739-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-488739-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-475344",
  "name": "Quần Dài Ống Cong Barrel Vải Jersey​",
  "slug": "quan-dai-ong-cong-barrel-vai-jersey-475344",
  "description": "Quần Dài Ống Cong Barrel Vải Jersey​ sở hữu chất vải co giãn 2 chiều thoải mái tối đa, đường may phẳng tỉ mỉ giúp đứng phom cả ngày. Thích hợp từ môi trường công sở đến những buổi dạo phố năng động.",
  "categoryId": "cat-pants",
  "categoryName": "Quần Dài",
  "basePrice": 980000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/sub/vngoods_475344_sub6_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_30_475344_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-475344-58-28",
      "sku": "UQ-475344-58-28",
      "size": "28",
      "color": "58 DARK GREEN",
      "colorCode": "58",
      "colorHex": "#166534",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-58-29",
      "sku": "UQ-475344-58-29",
      "size": "29",
      "color": "58 DARK GREEN",
      "colorCode": "58",
      "colorHex": "#166534",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-58-30",
      "sku": "UQ-475344-58-30",
      "size": "30",
      "color": "58 DARK GREEN",
      "colorCode": "58",
      "colorHex": "#166534",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-58-31",
      "sku": "UQ-475344-58-31",
      "size": "31",
      "color": "58 DARK GREEN",
      "colorCode": "58",
      "colorHex": "#166534",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-58-32",
      "sku": "UQ-475344-58-32",
      "size": "32",
      "color": "58 DARK GREEN",
      "colorCode": "58",
      "colorHex": "#166534",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-39-28",
      "sku": "UQ-475344-39-28",
      "size": "28",
      "color": "39 DARK BROWN",
      "colorCode": "39",
      "colorHex": "#3e2723",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-39-29",
      "sku": "UQ-475344-39-29",
      "size": "29",
      "color": "39 DARK BROWN",
      "colorCode": "39",
      "colorHex": "#3e2723",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-39-30",
      "sku": "UQ-475344-39-30",
      "size": "30",
      "color": "39 DARK BROWN",
      "colorCode": "39",
      "colorHex": "#3e2723",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-39-31",
      "sku": "UQ-475344-39-31",
      "size": "31",
      "color": "39 DARK BROWN",
      "colorCode": "39",
      "colorHex": "#3e2723",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-39-32",
      "sku": "UQ-475344-39-32",
      "size": "32",
      "color": "39 DARK BROWN",
      "colorCode": "39",
      "colorHex": "#3e2723",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-30-28",
      "sku": "UQ-475344-30-28",
      "size": "28",
      "color": "30 NATURAL",
      "colorCode": "30",
      "colorHex": "#fef3c7",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_30_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-30-29",
      "sku": "UQ-475344-30-29",
      "size": "29",
      "color": "30 NATURAL",
      "colorCode": "30",
      "colorHex": "#fef3c7",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_30_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-30-30",
      "sku": "UQ-475344-30-30",
      "size": "30",
      "color": "30 NATURAL",
      "colorCode": "30",
      "colorHex": "#fef3c7",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_30_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-30-31",
      "sku": "UQ-475344-30-31",
      "size": "31",
      "color": "30 NATURAL",
      "colorCode": "30",
      "colorHex": "#fef3c7",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_30_475344_3x4.jpg?width=750"
    },
    {
      "id": "v-475344-30-32",
      "sku": "UQ-475344-30-32",
      "size": "32",
      "color": "30 NATURAL",
      "colorCode": "30",
      "colorHex": "#fef3c7",
      "stockQuantity": 49,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_30_475344_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.9,
  "reviewCount": 999,
  "productCode": "475344",
  "fitRecommendation": "Cạp cao che khuyết điểm, ống đứng tôn dáng",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_58_475344_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/sub/vngoods_475344_sub6_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/475344/item/vngoods_39_475344_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-475344-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 58 DARK GREEN",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-475344-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-121425",
  "name": "Áo Ba Lỗ và Áo Hai Dây",
  "slug": "ao-ba-lo-va-ao-hai-day-121425",
  "description": "Áo Ba Lỗ và Áo Hai Dây trang bị sợi vi mảnh AIRism siêu mịn màng, làm mát tức thì và kháng khuẩn ngăn mùi. Thiết kế nhẹ như làn da thứ hai, thấm hút mồ hôi nhanh chóng.",
  "categoryId": "cat-tshirts",
  "categoryName": "Áo Thun",
  "basePrice": 195000,
  "thumbnailUrl": "https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg",
  "images": [
    "https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res3e8070eb2833a3c47ef137c82d3c083afr.png"
  ],
  "variants": [
    {
      "id": "v-121425-09-S",
      "sku": "UQ-121425-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 39,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg"
    },
    {
      "id": "v-121425-09-M",
      "sku": "UQ-121425-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg"
    },
    {
      "id": "v-121425-09-L",
      "sku": "UQ-121425-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg"
    },
    {
      "id": "v-121425-09-XL",
      "sku": "UQ-121425-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 37,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "121425",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://im.uniqlo.com/global-cms/spa/resf950b9d786a1f1c815c1c3614ae4b854fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res3e8070eb2833a3c47ef137c82d3c083afr.png"
  ],
  "reviews": [
    {
      "id": "rev-121425-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-121425-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-487120",
  "name": "Áo Ba Lỗ Cổ Henley",
  "slug": "ao-ba-lo-co-henley-487120",
  "description": "Áo Ba Lỗ Cổ Henley trang bị sợi vi mảnh AIRism siêu mịn màng, làm mát tức thì và kháng khuẩn ngăn mùi. Thiết kế nhẹ như làn da thứ hai, thấm hút mồ hôi nhanh chóng.",
  "categoryId": "cat-tshirts",
  "categoryName": "Áo Thun",
  "basePrice": 195000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_60_487120_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-487120-09-S",
      "sku": "UQ-487120-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-09-M",
      "sku": "UQ-487120-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-09-L",
      "sku": "UQ-487120-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 31,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-09-XL",
      "sku": "UQ-487120-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-00-S",
      "sku": "UQ-487120-00-S",
      "size": "S",
      "color": "00 WHITE",
      "colorCode": "00",
      "colorHex": "#ffffff",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-00-M",
      "sku": "UQ-487120-00-M",
      "size": "M",
      "color": "00 WHITE",
      "colorCode": "00",
      "colorHex": "#ffffff",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-00-L",
      "sku": "UQ-487120-00-L",
      "size": "L",
      "color": "00 WHITE",
      "colorCode": "00",
      "colorHex": "#ffffff",
      "stockQuantity": 31,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-00-XL",
      "sku": "UQ-487120-00-XL",
      "size": "XL",
      "color": "00 WHITE",
      "colorCode": "00",
      "colorHex": "#ffffff",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-60-S",
      "sku": "UQ-487120-60-S",
      "size": "S",
      "color": "60 LIGHT BLUE",
      "colorCode": "60",
      "colorHex": "#bae6fd",
      "stockQuantity": 45,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_60_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-60-M",
      "sku": "UQ-487120-60-M",
      "size": "M",
      "color": "60 LIGHT BLUE",
      "colorCode": "60",
      "colorHex": "#bae6fd",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_60_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-60-L",
      "sku": "UQ-487120-60-L",
      "size": "L",
      "color": "60 LIGHT BLUE",
      "colorCode": "60",
      "colorHex": "#bae6fd",
      "stockQuantity": 31,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_60_487120_3x4.jpg?width=750"
    },
    {
      "id": "v-487120-60-XL",
      "sku": "UQ-487120-60-XL",
      "size": "XL",
      "color": "60 LIGHT BLUE",
      "colorCode": "60",
      "colorHex": "#bae6fd",
      "stockQuantity": 53,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_60_487120_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "487120",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_09_487120_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_00_487120_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487120/item/vngoods_60_487120_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-487120-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-487120-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-487908",
  "name": "Áo Thun Vải Gân Cổ Henley",
  "slug": "ao-thun-vai-gan-co-henley-487908",
  "description": "Áo Thun Vải Gân Cổ Henley theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-tshirts",
  "categoryName": "Áo Thun",
  "basePrice": 488750,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_01_487908_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_02_487908_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-487908-69-S",
      "sku": "UQ-487908-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-69-M",
      "sku": "UQ-487908-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-69-L",
      "sku": "UQ-487908-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-69-XL",
      "sku": "UQ-487908-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-79-S",
      "sku": "UQ-487908-79-S",
      "size": "S",
      "color": "79 PURPLE DARK",
      "colorCode": "79",
      "colorHex": "#581c87",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-79-M",
      "sku": "UQ-487908-79-M",
      "size": "M",
      "color": "79 PURPLE DARK",
      "colorCode": "79",
      "colorHex": "#581c87",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-79-L",
      "sku": "UQ-487908-79-L",
      "size": "L",
      "color": "79 PURPLE DARK",
      "colorCode": "79",
      "colorHex": "#581c87",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-79-XL",
      "sku": "UQ-487908-79-XL",
      "size": "XL",
      "color": "79 PURPLE DARK",
      "colorCode": "79",
      "colorHex": "#581c87",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-01-S",
      "sku": "UQ-487908-01-S",
      "size": "S",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_01_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-01-M",
      "sku": "UQ-487908-01-M",
      "size": "M",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_01_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-01-L",
      "sku": "UQ-487908-01-L",
      "size": "L",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_01_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-01-XL",
      "sku": "UQ-487908-01-XL",
      "size": "XL",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_01_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-02-S",
      "sku": "UQ-487908-02-S",
      "size": "S",
      "color": "02 LIGHT GRAY",
      "colorCode": "02",
      "colorHex": "#e2e8f0",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_02_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-02-M",
      "sku": "UQ-487908-02-M",
      "size": "M",
      "color": "02 LIGHT GRAY",
      "colorCode": "02",
      "colorHex": "#e2e8f0",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_02_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-02-L",
      "sku": "UQ-487908-02-L",
      "size": "L",
      "color": "02 LIGHT GRAY",
      "colorCode": "02",
      "colorHex": "#e2e8f0",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_02_487908_3x4.jpg?width=750"
    },
    {
      "id": "v-487908-02-XL",
      "sku": "UQ-487908-02-XL",
      "size": "XL",
      "color": "02 LIGHT GRAY",
      "colorCode": "02",
      "colorHex": "#e2e8f0",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_02_487908_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "487908",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_69_487908_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_79_487908_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487908/item/vngoods_01_487908_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-487908-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-487908-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-488298",
  "name": "Áo Thun Vải Gân Có Mũ",
  "slug": "ao-thun-vai-gan-co-mu-488298",
  "description": "Áo Thun Vải Gân Có Mũ theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-tshirts",
  "categoryName": "Áo Thun",
  "basePrice": 488750,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_01_488298_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_09_488298_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-488298-69-S",
      "sku": "UQ-488298-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-69-M",
      "sku": "UQ-488298-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-69-L",
      "sku": "UQ-488298-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-69-XL",
      "sku": "UQ-488298-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-03-S",
      "sku": "UQ-488298-03-S",
      "size": "S",
      "color": "03 GRAY",
      "colorCode": "03",
      "colorHex": "#cbd5e1",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-03-M",
      "sku": "UQ-488298-03-M",
      "size": "M",
      "color": "03 GRAY",
      "colorCode": "03",
      "colorHex": "#cbd5e1",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-03-L",
      "sku": "UQ-488298-03-L",
      "size": "L",
      "color": "03 GRAY",
      "colorCode": "03",
      "colorHex": "#cbd5e1",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-03-XL",
      "sku": "UQ-488298-03-XL",
      "size": "XL",
      "color": "03 GRAY",
      "colorCode": "03",
      "colorHex": "#cbd5e1",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-01-S",
      "sku": "UQ-488298-01-S",
      "size": "S",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_01_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-01-M",
      "sku": "UQ-488298-01-M",
      "size": "M",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_01_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-01-L",
      "sku": "UQ-488298-01-L",
      "size": "L",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_01_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-01-XL",
      "sku": "UQ-488298-01-XL",
      "size": "XL",
      "color": "01 OFF WHITE",
      "colorCode": "01",
      "colorHex": "#f8fafc",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_01_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-09-S",
      "sku": "UQ-488298-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_09_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-09-M",
      "sku": "UQ-488298-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 35,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_09_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-09-L",
      "sku": "UQ-488298-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_09_488298_3x4.jpg?width=750"
    },
    {
      "id": "v-488298-09-XL",
      "sku": "UQ-488298-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 50,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_09_488298_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "488298",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_69_488298_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_03_488298_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/488298/item/vngoods_01_488298_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-488298-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-488298-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-489372",
  "name": "Áo Thun Mini | Raglan",
  "slug": "ao-thun-mini-raglan-489372",
  "description": "Áo Thun Mini | Raglan theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-tshirts",
  "categoryName": "Áo Thun",
  "basePrice": 488750,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-489372-37-S",
      "sku": "UQ-489372-37-S",
      "size": "S",
      "color": "37 BROWN",
      "colorCode": "37",
      "colorHex": "#92400e",
      "stockQuantity": 37,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750"
    },
    {
      "id": "v-489372-37-M",
      "sku": "UQ-489372-37-M",
      "size": "M",
      "color": "37 BROWN",
      "colorCode": "37",
      "colorHex": "#92400e",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750"
    },
    {
      "id": "v-489372-37-L",
      "sku": "UQ-489372-37-L",
      "size": "L",
      "color": "37 BROWN",
      "colorCode": "37",
      "colorHex": "#92400e",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750"
    },
    {
      "id": "v-489372-37-XL",
      "sku": "UQ-489372-37-XL",
      "size": "XL",
      "color": "37 BROWN",
      "colorCode": "37",
      "colorHex": "#92400e",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750"
    },
    {
      "id": "v-489372-69-S",
      "sku": "UQ-489372-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 37,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750"
    },
    {
      "id": "v-489372-69-M",
      "sku": "UQ-489372-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750"
    },
    {
      "id": "v-489372-69-L",
      "sku": "UQ-489372-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750"
    },
    {
      "id": "v-489372-69-XL",
      "sku": "UQ-489372-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 41,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "489372",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_37_489372_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489372/item/vngoods_69_489372_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-489372-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 37 BROWN",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-489372-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-489061",
  "name": "Áo Polo | Kẻ Sọc",
  "slug": "ao-polo-ke-soc-489061",
  "description": "Áo Polo | Kẻ Sọc theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-tshirts",
  "categoryName": "Áo Thun",
  "basePrice": 735000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-489061-69-S",
      "sku": "UQ-489061-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750"
    },
    {
      "id": "v-489061-69-M",
      "sku": "UQ-489061-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750"
    },
    {
      "id": "v-489061-69-L",
      "sku": "UQ-489061-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 38,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750"
    },
    {
      "id": "v-489061-69-XL",
      "sku": "UQ-489061-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750"
    },
    {
      "id": "v-489061-38-S",
      "sku": "UQ-489061-38-S",
      "size": "S",
      "color": "38 DARK BROWN",
      "colorCode": "38",
      "colorHex": "#451a03",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750"
    },
    {
      "id": "v-489061-38-M",
      "sku": "UQ-489061-38-M",
      "size": "M",
      "color": "38 DARK BROWN",
      "colorCode": "38",
      "colorHex": "#451a03",
      "stockQuantity": 30,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750"
    },
    {
      "id": "v-489061-38-L",
      "sku": "UQ-489061-38-L",
      "size": "L",
      "color": "38 DARK BROWN",
      "colorCode": "38",
      "colorHex": "#451a03",
      "stockQuantity": 38,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750"
    },
    {
      "id": "v-489061-38-XL",
      "sku": "UQ-489061-38-XL",
      "size": "XL",
      "color": "38 DARK BROWN",
      "colorCode": "38",
      "colorHex": "#451a03",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "489061",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_69_489061_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/489061/item/vngoods_38_489061_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-489061-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-489061-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-487328",
  "name": "Áo Choàng Balmacaan",
  "slug": "ao-choang-balmacaan-487328",
  "description": "Áo Choàng Balmacaan theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-tshirts",
  "categoryName": "Áo Thun",
  "basePrice": 3680000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-487328-07-S",
      "sku": "UQ-487328-07-S",
      "size": "S",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 34,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750"
    },
    {
      "id": "v-487328-07-M",
      "sku": "UQ-487328-07-M",
      "size": "M",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750"
    },
    {
      "id": "v-487328-07-L",
      "sku": "UQ-487328-07-L",
      "size": "L",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750"
    },
    {
      "id": "v-487328-07-XL",
      "sku": "UQ-487328-07-XL",
      "size": "XL",
      "color": "07 GRAY BEIGE",
      "colorCode": "07",
      "colorHex": "#d6d3d1",
      "stockQuantity": 47,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "487328",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/487328/item/vngoods_07_487328_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-487328-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 07 GRAY BEIGE",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-487328-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-477704",
  "name": "AirSense Áo Blazer",
  "slug": "airsense-ao-blazer-477704",
  "description": "AirSense Áo Blazer theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-tshirts",
  "categoryName": "Áo Thun",
  "basePrice": 1838750,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-477704-69-S",
      "sku": "UQ-477704-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 44,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750"
    },
    {
      "id": "v-477704-69-M",
      "sku": "UQ-477704-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750"
    },
    {
      "id": "v-477704-69-L",
      "sku": "UQ-477704-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 32,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750"
    },
    {
      "id": "v-477704-69-XL",
      "sku": "UQ-477704-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 38,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.9,
  "reviewCount": 56,
  "productCode": "477704",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/477704/item/vngoods_69_477704_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-477704-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 69 NAVY",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-477704-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-491199",
  "name": "Bộ Pyjama Vải Satin",
  "slug": "bo-pyjama-vai-satin-491199",
  "description": "Bộ Pyjama Vải Satin theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-loungewear",
  "categoryName": "Đồ Mặc Nhà",
  "basePrice": 588000,
  "thumbnailUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750",
  "images": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750"
  ],
  "variants": [
    {
      "id": "v-491199-10-S",
      "sku": "UQ-491199-10-S",
      "size": "S",
      "color": "10 PINK",
      "colorCode": "10",
      "colorHex": "#f472b6",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750"
    },
    {
      "id": "v-491199-10-M",
      "sku": "UQ-491199-10-M",
      "size": "M",
      "color": "10 PINK",
      "colorCode": "10",
      "colorHex": "#f472b6",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750"
    },
    {
      "id": "v-491199-10-L",
      "sku": "UQ-491199-10-L",
      "size": "L",
      "color": "10 PINK",
      "colorCode": "10",
      "colorHex": "#f472b6",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750"
    },
    {
      "id": "v-491199-10-XL",
      "sku": "UQ-491199-10-XL",
      "size": "XL",
      "color": "10 PINK",
      "colorCode": "10",
      "colorHex": "#f472b6",
      "stockQuantity": 33,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750"
    },
    {
      "id": "v-491199-69-S",
      "sku": "UQ-491199-69-S",
      "size": "S",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750"
    },
    {
      "id": "v-491199-69-M",
      "sku": "UQ-491199-69-M",
      "size": "M",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750"
    },
    {
      "id": "v-491199-69-L",
      "sku": "UQ-491199-69-L",
      "size": "L",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 36,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750"
    },
    {
      "id": "v-491199-69-XL",
      "sku": "UQ-491199-69-XL",
      "size": "XL",
      "color": "69 NAVY",
      "colorCode": "69",
      "colorHex": "#0f172a",
      "stockQuantity": 33,
      "priceModifier": 0,
      "garmentImageUrl": "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "491199",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_10_491199_3x4.jpg?width=750",
    "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/491199/item/vngoods_69_491199_3x4.jpg?width=750"
  ],
  "reviews": [
    {
      "id": "rev-491199-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 10 PINK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-491199-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
},
{
  "id": "uq-294585",
  "name": "Chân Váy Xếp Ly Vải Nylon",
  "slug": "chan-vay-xep-ly-vai-nylon-294585",
  "description": "Chân Váy Xếp Ly Vải Nylon theo triết lý LifeWear Nhật Bản: Tinh giản, chú trọng chất lượng từng đường kim mũi chỉ và mang lại sự thoải mái tối ưu cho người mặc suốt ngày dài.",
  "categoryId": "cat-dresses",
  "categoryName": "Đầm & Váy",
  "basePrice": 784000,
  "thumbnailUrl": "https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg",
  "images": [
    "https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res3e8070eb2833a3c47ef137c82d3c083afr.png"
  ],
  "variants": [
    {
      "id": "v-294585-09-S",
      "sku": "UQ-294585-09-S",
      "size": "S",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 38,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg"
    },
    {
      "id": "v-294585-09-M",
      "sku": "UQ-294585-09-M",
      "size": "M",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 43,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg"
    },
    {
      "id": "v-294585-09-L",
      "sku": "UQ-294585-09-L",
      "size": "L",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 40,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg"
    },
    {
      "id": "v-294585-09-XL",
      "sku": "UQ-294585-09-XL",
      "size": "XL",
      "color": "09 BLACK",
      "colorCode": "09",
      "colorHex": "#111111",
      "stockQuantity": 42,
      "priceModifier": 0,
      "garmentImageUrl": "https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg"
    }
  ],
  "inStock": true,
  "featured": false,
  "rating": 4.8,
  "reviewCount": 88,
  "productCode": "294585",
  "fitRecommendation": "Chuẩn phom LifeWear Regular Fit",
  "styleHintImages": [
    "https://im.uniqlo.com/global-cms/spa/res106761bfa26551b32346d847bdde1715fr.jpg",
    "https://im.uniqlo.com/global-cms/spa/res3e8070eb2833a3c47ef137c82d3c083afr.png"
  ],
  "reviews": [
    {
      "id": "rev-294585-1",
      "author": "Minh Trang N.",
      "rating": 5,
      "date": "14/10/2026",
      "sizeBought": "Size M - 09 BLACK",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Chất vải cực kỳ đẹp và mát, chuẩn LifeWear. Thử đồ AI trên web xong đặt về mặc vừa vặn hoàn toàn!"
    },
    {
      "id": "rev-294585-2",
      "author": "Hoàng Nam",
      "rating": 5,
      "date": "11/10/2026",
      "sizeBought": "Size L",
      "fitAssessment": "Vừa vặn hoàn hảo",
      "comment": "Đóng gói đẹp, giao hàng nhanh trong 24h. Rất thích chất liệu và phom dáng đứng form."
    }
  ]
}
];

export const MOCK_TRYON_MODELS = [
  {
    id: 'model-f1',
    name: 'Mẫu Nữ Mai Anh (1m65 - 50kg)',
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-f2',
    name: 'Mẫu Nữ Lan Thy (1m70 - 54kg)',
    gender: 'female',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-m1',
    name: 'Mẫu Nam Tuấn Kiệt (1m78 - 68kg)',
    gender: 'male',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'model-m2',
    name: 'Mẫu Nam Hoàng Hải (1m82 - 75kg)',
    gender: 'male',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80'
  }
];
