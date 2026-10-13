import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Product, ProductVariant } from '../../features/catalog/models/product.model';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, Category } from '../data/mock-products';

export interface AdminOrder {
  id: string;
  orderCode: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  shippingAddress: string;
  date: string;
  itemsCount: number;
  items: Array<{
    productName: string;
    variantInfo: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  shippingFee: number;
  total: number;
  payment: 'COD' | 'MoMo' | 'VNPay-QR' | 'Thẻ Tín Dụng';
  status: 'Chờ xử lý' | 'Đang chuẩn bị' | 'Đang giao hàng' | 'Đã giao' | 'Đã hủy';
}

@Injectable({
  providedIn: 'root'
})
export class ProductStateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Reactive State Signals
  readonly products = signal<Product[]>(MOCK_PRODUCTS);
  readonly categories = signal<Category[]>(MOCK_CATEGORIES);

  readonly orders = signal<AdminOrder[]>([
    {
      id: 'o-1',
      orderCode: 'FA-2026-981240',
      customerName: 'Nguyễn Thế Anh',
      customerPhone: '0988 123 456',
      customerEmail: 'customer@fashionai.com',
      shippingAddress: 'Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh',
      date: '12/10/2026',
      itemsCount: 2,
      items: [
        { productName: 'Áo Blazer Linen Cổ Điển', variantInfo: 'Đen - Size M', quantity: 1, price: 899000 },
        { productName: 'Áo Thun Cotton Supima', variantInfo: 'Trắng - Size L', quantity: 1, price: 349000 }
      ],
      subtotal: 1248000,
      shippingFee: 0,
      total: 1248000,
      payment: 'COD',
      status: 'Đang giao hàng'
    },
    {
      id: 'o-2',
      orderCode: 'FA-2026-773192',
      customerName: 'Trần Thị Mai',
      customerPhone: '0912 345 678',
      customerEmail: 'mai.tran@example.com',
      shippingAddress: 'Quận Cầu Giấy, Hà Nội',
      date: '02/10/2026',
      itemsCount: 1,
      items: [
        { productName: 'Áo Blazer Linen Cổ Điển', variantInfo: 'Beige - Size S', quantity: 1, price: 899000 }
      ],
      subtotal: 899000,
      shippingFee: 0,
      total: 899000,
      payment: 'MoMo',
      status: 'Đã giao'
    },
    {
      id: 'o-3',
      orderCode: 'FA-2026-664119',
      customerName: 'Lê Hoàng Nam',
      customerPhone: '0977 654 321',
      customerEmail: 'nam.le@example.com',
      shippingAddress: 'Hải Châu, Đà Nẵng',
      date: '13/10/2026',
      itemsCount: 2,
      items: [
        { productName: 'Đầm Maxi Lụa Cổ Chữ V', variantInfo: 'Hồng Nude - Size M', quantity: 1, price: 1290000 },
        { productName: 'Áo Blazer Linen Cổ Điển', variantInfo: 'Đen - Size L', quantity: 1, price: 900000 }
      ],
      subtotal: 2190000,
      shippingFee: 0,
      total: 2190000,
      payment: 'VNPay-QR',
      status: 'Đang chuẩn bị'
    }
  ]);

  // Try-On Simulation metrics
  readonly tryOnCount = signal<number>(142);

  // Admin Dashboard Computed KPIs
  readonly totalRevenue = computed(() =>
    this.orders()
      .filter(o => o.status !== 'Đã hủy')
      .reduce((sum, o) => sum + o.total, 0)
  );

  readonly totalOrdersCount = computed(() => this.orders().length);
  readonly totalProductsCount = computed(() => this.products().length);

  readonly lowStockVariantsCount = computed(() => {
    let count = 0;
    this.products().forEach(p => {
      p.variants.forEach(v => {
        if (v.stockQuantity < 15) count++;
      });
    });
    return count;
  });

  // --- Product CRUD Methods (Admin Permission) ---

  addProduct(newProd: Product): void {
    this.products.update(list => [newProd, ...list]);
  }

  updateProduct(productId: string, updatedFields: Partial<Product>): void {
    this.products.update(list =>
      list.map(p => (p.id === productId ? { ...p, ...updatedFields } : p))
    );
  }

  deleteProduct(productId: string): void {
    this.products.update(list => list.filter(p => p.id !== productId));
  }

  toggleStock(productId: string): void {
    this.products.update(list =>
      list.map(p => {
        if (p.id === productId) {
          const nextStock = !p.inStock;
          return {
            ...p,
            inStock: nextStock,
            variants: p.variants.map(v => ({
              ...v,
              stockQuantity: nextStock ? (v.stockQuantity > 0 ? v.stockQuantity : 10) : 0
            }))
          };
        }
        return p;
      })
    );
  }

  updateVariantStock(productId: string, variantId: string, newStock: number): void {
    this.products.update(list =>
      list.map(p => {
        if (p.id === productId) {
          const updatedVariants = p.variants.map(v =>
            v.id === variantId ? { ...v, stockQuantity: Math.max(0, newStock) } : v
          );
          const hasAnyStock = updatedVariants.some(v => v.stockQuantity > 0);
          return { ...p, variants: updatedVariants, inStock: hasAnyStock };
        }
        return p;
      })
    );
  }

  // --- Category CRUD Methods ---

  addCategory(newCat: Category): void {
    this.categories.update(list => [...list, newCat]);
  }

  updateCategory(catId: string, updatedFields: Partial<Category>): void {
    this.categories.update(list =>
      list.map(c => (c.id === catId ? { ...c, ...updatedFields } : c))
    );
  }

  deleteCategory(catId: string): void {
    this.categories.update(list => list.filter(c => c.id !== catId));
  }

  // --- Order Methods ---

  updateOrderStatus(orderId: string, status: AdminOrder['status']): void {
    this.orders.update(list =>
      list.map(o => (o.id === orderId ? { ...o, status } : o))
    );
  }

  addCustomerOrder(order: AdminOrder): void {
    this.orders.update(list => [order, ...list]);
  }

  // --- Try-on increment ---
  incrementTryOn(): void {
    this.tryOnCount.update(c => c + 1);
  }
}
