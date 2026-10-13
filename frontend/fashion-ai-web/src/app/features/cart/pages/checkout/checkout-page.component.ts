import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';
import { SeoService } from '../../../../core/services/seo.service';

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

    if (this.cartService.items().length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  submitOrder(): void {
    if (!this.formData.fullName || !this.formData.phone || !this.formData.address) {
      alert('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng.');
      return;
    }

    this.isSubmitting.set(true);

    // Simulate order placement
    setTimeout(() => {
      const generatedCode = `FA-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
      this.orderSuccessCode.set(generatedCode);
      this.cartService.clearCart();
      this.isSubmitting.set(false);
    }, 1200);
  }
}
