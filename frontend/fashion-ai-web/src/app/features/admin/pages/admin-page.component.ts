import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ProductStateService, AdminOrder } from '../../../core/services/product-state.service';
import { Product, ProductVariant } from '../../catalog/models/product.model';
import { Category } from '../../../core/data/mock-products';
import { UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.scss']
})
export class AdminPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);
  readonly productState = inject(ProductStateService);

  // Active navigation tab in Admin
  activeTab = signal<'dashboard' | 'products' | 'categories' | 'inventory' | 'orders' | 'users'>('dashboard');

  // Search & Filter in Admin
  productSearch = signal<string>('');
  productCategoryFilter = signal<string>('all');
  orderStatusFilter = signal<string>('all');

  // Computed filtered products for Admin Table
  filteredProducts = computed(() => {
    const list = this.productState.products();
    const query = this.productSearch().toLowerCase().trim();
    const cat = this.productCategoryFilter();

    return list.filter(p => {
      const matchQuery = !query || p.name.toLowerCase().includes(query) || p.slug.toLowerCase().includes(query);
      const matchCat = cat === 'all' || p.categoryId === cat;
      return matchQuery && matchCat;
    });
  });

  // Computed filtered orders
  filteredOrders = computed(() => {
    const list = this.productState.orders();
    const status = this.orderStatusFilter();
    if (status === 'all') return list;
    return list.filter(o => o.status === status);
  });

  // Feedback notification message
  adminMessage = signal<string | null>(null);

  // --- MODAL: Add New Product Form State ---
  isAddModalOpen = signal<boolean>(false);
  newProductName = signal('');
  newProductCategory = signal('cat-women-tops');
  newProductBasePrice = signal<number>(499000);
  newProductOriginalPrice = signal<number>(649000);
  newProductThumbnail = signal('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
  newProductGarment = signal('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80');
  newProductColor = signal('Đen');
  newProductSizes = signal('S, M, L');
  newProductStock = signal<number>(30);
  newProductDescription = signal('Thiết kế tối giản hiện đại, chất liệu tự nhiên thân thiện với môi trường theo triết lý LifeWear.');
  newProductFeatured = signal(true);
  newProductInStock = signal(true);

  // --- MODAL: Edit Existing Product Form State ---
  isEditModalOpen = signal<boolean>(false);
  editingProductId = signal<string | null>(null);
  editProductName = signal('');
  editProductCategory = signal('');
  editProductBasePrice = signal<number>(0);
  editProductOriginalPrice = signal<number>(0);
  editProductThumbnail = signal('');
  editProductDescription = signal('');
  editProductInStock = signal<boolean>(true);

  // --- MODAL: View Order Detail State ---
  selectedOrder = signal<AdminOrder | null>(null);

  // --- MODAL: Add Category State ---
  isAddCategoryOpen = signal<boolean>(false);
  newCategoryName = signal('');
  newCategorySlug = signal('');
  newCategoryGender = signal<'women' | 'men' | 'kids' | 'unisex'>('women');
  newCategoryImageUrl = signal('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80');

  // --- MODAL: Add User State ---
  isAddUserOpen = signal<boolean>(false);
  newUserName = signal('');
  newUserEmail = signal('');
  newUserRole = signal<UserRole>('customer');

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Quản Trị Hệ Thống (Admin Backoffice) | Fashion AI Studio',
      description: 'Cổng thông tin quản trị toàn diện: setup sản phẩm, danh mục, tồn kho, đơn hàng và phân quyền tài khoản.',
      keywords: 'Admin, Backoffice, quản trị sản phẩm, phân quyền vai trò'
    });
  }

  // --- Product Operations ---

  openAddProductModal(): void {
    this.newProductName.set('');
    this.newProductBasePrice.set(499000);
    this.newProductOriginalPrice.set(649000);
    this.newProductCategory.set(this.productState.categories()[0]?.id || 'cat-women-tops');
    this.isAddModalOpen.set(true);
  }

  closeAddProductModal(): void {
    this.isAddModalOpen.set(false);
  }

  saveNewProduct(): void {
    const name = this.newProductName().trim();
    if (!name) {
      alert('Vui lòng nhập tên sản phẩm!');
      return;
    }

    const categoryObj = this.productState.categories().find(c => c.id === this.newProductCategory());
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const sizes = this.newProductSizes().split(',').map(s => s.trim()).filter(Boolean);
    const color = this.newProductColor().trim() || 'Tiêu chuẩn';
    const stockPerVariant = Math.max(1, Math.floor(this.newProductStock() / (sizes.length || 1)));

    const variants: ProductVariant[] = (sizes.length ? sizes : ['F']).map((size, index) => ({
      id: `v-${Date.now()}-${index}`,
      sku: `${slug.substring(0, 6).toUpperCase()}-${color.substring(0, 3).toUpperCase()}-${size}`,
      size,
      color,
      stockQuantity: stockPerVariant,
      priceModifier: 0,
      garmentImageUrl: this.newProductGarment() || this.newProductThumbnail()
    }));

    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name,
      slug,
      description: this.newProductDescription(),
      categoryId: this.newProductCategory(),
      categoryName: categoryObj?.name || 'Áo',
      basePrice: this.newProductBasePrice(),
      originalPrice: this.newProductOriginalPrice() || undefined,
      thumbnailUrl: this.newProductThumbnail(),
      images: [
        this.newProductThumbnail(),
        this.newProductGarment()
      ],
      variants,
      inStock: this.newProductInStock(),
      featured: this.newProductFeatured()
    };

    this.productState.addProduct(newProd);
    this.closeAddProductModal();
    this.showMessage(`Đã setup và tạo thành công sản phẩm: "${name}"!`);
  }

  openEditProductModal(product: Product): void {
    this.editingProductId.set(product.id);
    this.editProductName.set(product.name);
    this.editProductCategory.set(product.categoryId);
    this.editProductBasePrice.set(product.basePrice);
    this.editProductOriginalPrice.set(product.originalPrice || product.basePrice);
    this.editProductThumbnail.set(product.thumbnailUrl);
    this.editProductDescription.set(product.description);
    this.editProductInStock.set(product.inStock);
    this.isEditModalOpen.set(true);
  }

  closeEditProductModal(): void {
    this.isEditModalOpen.set(false);
    this.editingProductId.set(null);
  }

  saveEditProduct(): void {
    const id = this.editingProductId();
    if (!id) return;

    const categoryObj = this.productState.categories().find(c => c.id === this.editProductCategory());

    this.productState.updateProduct(id, {
      name: this.editProductName(),
      categoryId: this.editProductCategory(),
      categoryName: categoryObj?.name,
      basePrice: this.editProductBasePrice(),
      originalPrice: this.editProductOriginalPrice(),
      thumbnailUrl: this.editProductThumbnail(),
      description: this.editProductDescription(),
      inStock: this.editProductInStock()
    });

    this.closeEditProductModal();
    this.showMessage('Đã cập nhật thông tin sản phẩm thành công!');
  }

  deleteProduct(product: Product): void {
    if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" khỏi hệ thống?`)) {
      this.productState.deleteProduct(product.id);
      this.showMessage(`Đã xóa sản phẩm: "${product.name}"`);
    }
  }

  toggleStock(product: Product): void {
    this.productState.toggleStock(product.id);
    const newStatus = !product.inStock ? 'Còn hàng' : 'Hết hàng';
    this.showMessage(`Đã chuyển trạng thái sản phẩm "${product.name}" sang: ${newStatus}`);
  }

  adjustVariantStock(productId: string, variantId: string, currentStock: number, delta: number): void {
    const next = Math.max(0, currentStock + delta);
    this.productState.updateVariantStock(productId, variantId, next);
  }

  // --- Category Operations ---

  saveNewCategory(): void {
    const name = this.newCategoryName().trim();
    if (!name) {
      alert('Vui lòng nhập tên danh mục!');
      return;
    }

    const slug = this.newCategorySlug().trim() || name.toLowerCase().replace(/\s+/g, '-');
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      gender: this.newCategoryGender(),
      imageUrl: this.newCategoryImageUrl(),
      itemCount: 0
    };

    this.productState.addCategory(newCat);
    this.isAddCategoryOpen.set(false);
    this.newCategoryName.set('');
    this.showMessage(`Đã thêm danh mục mới: "${name}"!`);
  }

  deleteCategory(cat: Category): void {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${cat.name}"?`)) {
      this.productState.deleteCategory(cat.id);
      this.showMessage(`Đã xóa danh mục: "${cat.name}"`);
    }
  }

  // --- Order Operations ---

  updateOrderStatus(orderId: string, event: Event): void {
    const target = event.target as HTMLSelectElement;
    const newStatus = target.value as AdminOrder['status'];
    this.productState.updateOrderStatus(orderId, newStatus);
    this.showMessage(`Đã cập nhật trạng thái đơn hàng sang "${newStatus}"!`);
  }

  viewOrderDetail(order: AdminOrder): void {
    this.selectedOrder.set(order);
  }

  closeOrderDetail(): void {
    this.selectedOrder.set(null);
  }

  // --- User & Role Management Operations ---

  toggleUserRole(user: any): void {
    const nextRole: UserRole = user.role === 'admin' ? 'customer' : 'admin';
    const roleText = nextRole === 'admin' ? 'Quản Trị Viên (Admin)' : 'Người Xem (Customer)';
    if (confirm(`Chuyển vai trò của tài khoản "${user.fullName || user.email}" thành ${roleText}?`)) {
      this.authService.updateUserRole(user.id, nextRole);
      this.showMessage(`Đã đổi vai trò của "${user.email}" thành "${nextRole.toUpperCase()}"!`);
    }
  }

  toggleUserStatus(user: any): void {
    this.authService.toggleUserStatus(user.id);
    const text = user.status === 'suspended' ? 'kích hoạt lại' : 'tạm khóa';
    this.showMessage(`Đã ${text} tài khoản "${user.email}"!`);
  }

  saveNewUser(): void {
    if (!this.newUserEmail().trim()) return;
    this.authService.addNewUser({
      fullName: this.newUserName() || 'Thành Viên Mới',
      email: this.newUserEmail(),
      role: this.newUserRole()
    });
    this.isAddUserOpen.set(false);
    this.newUserName.set('');
    this.newUserEmail.set('');
    this.showMessage('Đã tạo và phân quyền tài khoản người dùng mới thành công!');
  }

  // --- Role Switch Simulator (For Demo & Testing) ---

  simulateSwitchToCustomer(): void {
    this.authService.switchRole('customer');
    this.showMessage('Đã chuyển sang vai trò Người Xem (Customer)! Đang kiểm tra rào cản truy cập...');
    setTimeout(() => {
      this.router.navigate(['/access-denied']);
    }, 800);
  }

  simulateLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  private showMessage(msg: string): void {
    this.adminMessage.set(msg);
    setTimeout(() => {
      this.adminMessage.set(null);
    }, 3000);
  }
}
