import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SeoService } from '../../../core/services/seo.service';
import { CartItem } from '../models/cart.model';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeaderComponent, ButtonComponent],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.scss']
})
export class CartPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  cartItems = signal<CartItem[]>([
    {
      id: 'ci-1',
      productId: 'p-1',
      productName: 'Áo Blazer Oversize Thanh Lịch',
      size: 'M',
      color: 'Đen',
      price: 850000,
      quantity: 1,
      thumbnailUrl: ''
    }
  ]);

  get subtotal(): number {
    return this.cartItems().reduce((acc, item) => acc + item.price * item.quantity, 0);
  }

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Giỏ Hàng - FashionAI Studio',
      description: 'Giỏ hàng mua sắm thời trang của bạn tại FashionAI Studio.'
    });
  }

  updateQuantity(item: CartItem, delta: number): void {
    this.cartItems.update(items =>
      items.map(i => {
        if (i.id === item.id) {
          const newQty = Math.max(1, i.quantity + delta);
          return { ...i, quantity: newQty };
        }
        return i;
      })
    );
  }

  removeItem(item: CartItem): void {
    this.cartItems.update(items => items.filter(i => i.id !== item.id));
  }
}
