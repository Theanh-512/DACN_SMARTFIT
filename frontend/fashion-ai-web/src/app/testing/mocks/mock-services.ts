export interface MockProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  imageUrl: string;
  sku: string;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    id: 'prod-001',
    name: 'Áo Thun Cotton Oversized Minimalist',
    category: 'Áo Nam/Nữ',
    price: 349000,
    imageUrl: '/assets/images/mock-tshirt.jpg',
    sku: 'TSHIRT-001'
  },
  {
    id: 'prod-002',
    name: 'Quần Jeans Ống Suông Vintage',
    category: 'Quần',
    price: 599000,
    imageUrl: '/assets/images/mock-jeans.jpg',
    sku: 'JEANS-002'
  },
  {
    id: 'prod-003',
    name: 'Áo Blazer Hàn Quốc Form Rộng',
    category: 'Áo Khoác',
    price: 899000,
    imageUrl: '/assets/images/mock-blazer.jpg',
    sku: 'BLAZER-003'
  }
];

export interface MockTryOnResponse {
  task_id: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  result_image_url?: string;
  latency_ms?: number;
}

export const MOCK_TRYON_RESPONSE: MockTryOnResponse = {
  task_id: 'vton-test-12345',
  status: 'COMPLETED',
  result_image_url: 'https://storage.fashionai.vn/results/vton-test-12345.png',
  latency_ms: 3200
};

