import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ProductStateService, AdminOrder } from '../../../../core/services/product-state.service';
import { AuthService } from '../../../../core/auth/auth.service';

interface ShippingForm {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
}

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './checkout-page.component.html',
  styleUrls: ['./checkout-page.component.scss']
})
export class CheckoutPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly productState = inject(ProductStateService);
  readonly authService = inject(AuthService);

  formData: ShippingForm = {
    fullName: '',
    phone: '',
    email: '',
    address: '',
    city: 'Hồ Chí Minh',
    notes: ''
  };

  shippingMethod = signal<'standard' | 'express'>('standard');
  paymentMethod = signal<'cod' | 'momo' | 'vnpay' | 'card'>('cod');
  isSubmitting = signal<boolean>(false);
  orderSuccessCode = signal<string | null>(null);

  get shippingCost(): number {
    if (this.shippingMethod() === 'express') return 50000;
    return this.cartService.shippingFee();
  }

  get grandTotal(): number {
    return this.cartService.subtotal() + this.shippingCost;
  }

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Thanh Toán Đơn Hàng | Fashion AI Studio',
      description: 'Hoàn tất thông tin giao hàng và thanh toán an toàn, bảo mật tại Fashion AI Studio.',
      keywords: 'Thanh toán, đặt hàng, mua sắm thời trang'
    });

    // Auto-fill from current user profile if available
    const user = this.authService.currentUser();
    if (user) {
      this.formData.fullName = user.fullName || user.username;
      this.formData.email = user.email;
      this.formData.phone = user.phone || '0988 123 456';
      this.formData.address = user.address || 'Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh';
    }

    if (this.cartService.items().length === 0 && !this.orderSuccessCode()) {
      this.router.navigate(['/cart']);
    }
  }

  submitOrder(): void {
    if (!this.formData.fullName || !this.formData.phone || !this.formData.address) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.');
      return;
    }

    this.isSubmitting.set(true);

    // Prepare items list for Admin Order
    const orderItems = this.cartService.items().map(i => ({
      productName: i.productName,
      variantInfo: `${i.color} - Size ${i.size}`,
      quantity: i.quantity,
      price: i.price
    }));

    const paymentMap: Record<string, AdminOrder['payment']> = {
      cod: 'COD',
      momo: 'MoMo',
      vnpay: 'VNPay-QR',
      card: 'Thẻ Tín Dụng'
    };

    // Simulate order placement
    setTimeout(() => {
      const generatedCode = `FA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder: AdminOrder = {
        id: `o-${Date.now()}`,
        orderCode: generatedCode,
        customerName: this.formData.fullName,
        customerPhone: this.formData.phone,
        customerEmail: this.formData.email,
        shippingAddress: `${this.formData.address}, ${this.formData.city}`,
        date: new Date().toLocaleDateString('vi-VN'),
        itemsCount: this.cartService.count(),
        items: orderItems,
        subtotal: this.cartService.subtotal(),
        shippingFee: this.shippingCost,
        total: this.grandTotal,
        payment: paymentMap[this.paymentMethod()] || 'COD',
        status: 'Chờ xử lý'
      };

      // Add to Central State so Admin can manage and update immediately
      this.productState.addCustomerOrder(newOrder);

      this.orderSuccessCode.set(generatedCode);
      this.cartService.clearCart();
      this.isSubmitting.set(false);
    }, 1200);
  }
}
