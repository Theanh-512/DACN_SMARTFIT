import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, Category } from '../../../core/data/mock-products';
import { Product } from '../../catalog/models/product.model';

interface AdminOrder {
  id: string;
  orderCode: string;
  customerName: string;
  date: string;
  total: number;
  payment: string;
  status: 'Đang chuẩn bị' | 'Đang giao hàng' | 'Đã giao' | 'Đã hủy';
}

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  activeTab = signal<'products' | 'categories' | 'inventory' | 'orders'>('products');

  products = signal<Product[]>(MOCK_PRODUCTS);
  categories = signal<Category[]>(MOCK_CATEGORIES);

  orders = signal<AdminOrder[]>([
    {
      id: 'o-1',
      orderCode: 'FA-2026-981240',
      customerName: 'Nguyễn Thế Anh',
      date: '12/10/2026',
      total: 1248000,
      payment: 'COD',
      status: 'Đang giao hàng'
    },
    {
      id: 'o-2',
      orderCode: 'FA-2026-773192',
      customerName: 'Trần Thị Mai',
      date: '02/10/2026',
      total: 899000,
      payment: 'MoMo',
      status: 'Đã giao'
    },
    {
      id: 'o-3',
      orderCode: 'FA-2026-664119',
      customerName: 'Lê Hoàng Nam',
      date: '13/10/2026',
      total: 2190000,
      payment: 'VNPay-QR',
      status: 'Đang chuẩn bị'
    }
  ]);

  // Form Thêm sản phẩm mới modal / inline
  isAddProductOpen = signal<boolean>(false);
  newProductName = signal('');
  newProductPrice = signal<number>(500000);
  newProductCategory = signal('cat-women-tops');
  adminMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Quản Trị Hệ Thống (Admin Backoffice) | Fashion AI Studio',
      description: 'Quản lý danh mục sản phẩm, tồn kho và theo dõi xử lý đơn hàng.',
      keywords: 'Admin, quản trị sản phẩm, quản trị đơn hàng'
    });
  }

  deleteProduct(id: string): void {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.products.update(list => list.filter(p => p.id !== id));
      this.showMessage('Đã xóa sản phẩm thành công!');
    }
  }

  saveNewProduct(): void {
    if (!this.newProductName().trim()) return;

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: this.newProductName(),
      slug: this.newProductName().toLowerCase().replace(/\s+/g, '-'),
      description: 'Sản phẩm mới vừa cập nhật trên hệ thống.',
      categoryId: this.newProductCategory(),
      categoryName: this.categories().find(c => c.id === this.newProductCategory())?.name || 'Áo',
      basePrice: this.newProductPrice(),
      thumbnailUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'],
      variants: [
        { id: 'v-new', sku: 'NEW-01', size: 'M', color: 'Đen', stockQuantity: 20, priceModifier: 0, garmentImageUrl: '' }
      ],
      inStock: true,
      featured: false
    };

    this.products.update(list => [newProd, ...list]);
    this.isAddProductOpen.set(false);
    this.newProductName.set('');
    this.showMessage('Thêm mới sản phẩm thành công!');
  }

  updateOrderStatus(orderId: string, newStatus: any): void {
    this.orders.update(list =>
      list.map(o => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    this.showMessage(`Đã cập nhật trạng thái đơn sang "${newStatus}"!`);
  }

  private showMessage(msg: string): void {
    this.adminMessage.set(msg);
    setTimeout(() => {
      this.adminMessage.set(null);
    }, 2500);
  }
}
