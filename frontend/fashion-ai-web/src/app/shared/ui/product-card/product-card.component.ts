import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../features/catalog/models/product.model';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  product = input.required<Product>();
  tryOnClicked = output<Product>();
  addToCartClicked = output<Product>();

  activeImage = signal<string | null>(null);
  selectedColor = signal<string | null>(null);

  get currentImage(): string {
    return this.activeImage() || this.product().thumbnailUrl;
  }

  get hasDiscount(): boolean {
    const p = this.product();
    return !!(p.originalPrice && p.originalPrice > p.basePrice);
  }

  get discountPercentage(): number | null {
    const p = this.product();
    if (p.originalPrice && p.originalPrice > p.basePrice) {
      return Math.round(((p.originalPrice - p.basePrice) / p.originalPrice) * 100);
    }
    return null;
  }

  get uniqueColors(): { name: string; hex: string; imgUrl: string }[] {
    const p = this.product();
    const colorMap: Record<string, string> = {
      'Đen': '#111111',
      'Trắng': '#ffffff',
      'Beige': '#e6decb',
      'Xanh Nhạt': '#93c5fd',
      'Xanh Rêu': '#4d5d53',
      'Xanh Da Trời': '#60a5fa',
      'Navy': '#1e293b',
      'Đen Than': '#1f2421',
      'Kem Trắng': '#faf6ee'
    };

    const seen = new Set<string>();
    const colors: { name: string; hex: string; imgUrl: string }[] = [];

    p.variants.forEach(v => {
      if (!seen.has(v.color)) {
        seen.add(v.color);
        colors.push({
          name: v.color,
          hex: colorMap[v.color] || '#999999',
          imgUrl: v.garmentImageUrl
        });
      }
    });

    return colors;
  }

  onColorSelect(color: { name: string; hex: string; imgUrl: string }, event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.selectedColor.set(color.name);
    if (color.imgUrl) {
      this.activeImage.set(color.imgUrl);
    }
  }

  onTryOn(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.tryOnClicked.emit(this.product());
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.addToCartClicked.emit(this.product());
  }
}
