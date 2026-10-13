import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  promoCode = signal<string>('');
  discountRate = signal<number>(0);
  promoMessage = signal<string | null>(null);

  get discountAmount(): number {
    return Math.round(this.cartService.subtotal() * this.discountRate());
  }

  get finalTotal(): number {
    return Math.max(0, this.cartService.total() - this.discountAmount);
  }

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Giỏ Hàng | Fashion AI Studio',
      description: 'Xem lại các sản phẩm thời trang trong giỏ hàng của bạn và tiến hành đặt hàng tiện lợi.',
      keywords: 'Giỏ hàng, thanh toán, thời trang LifeWear'
    });
  }

  applyPromo(): void {
    const code = this.promoCode().trim().toUpperCase();
    if (code === 'FASHIONAI10' || code === 'UNIQLO10') {
      this.discountRate.set(0.1);
      this.promoMessage.set('Áp dụng mã thành công: Giảm 10% tổng đơn hàng!');
    } else if (code) {
      this.discountRate.set(0);
      this.promoMessage.set('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
    }
  }

  proceedToCheckout(): void {
    this.router.navigate(['/cart/checkout']);
  }
}
