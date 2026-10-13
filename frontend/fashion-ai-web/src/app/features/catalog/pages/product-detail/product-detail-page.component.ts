import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, ProductVariant } from '../../models/product.model';
import { MOCK_PRODUCTS } from '../../../../core/data/mock-products';
import { CartService } from '../../../../core/services/cart.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ProductGridComponent } from '../../../../shared/ui/product-grid/product-grid.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductGridComponent, ModalComponent],
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss']
})
export class ProductDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  readonly cartService = inject(CartService);

  product = signal<Product | null>(null);
  selectedImage = signal<string>('');
  selectedColor = signal<string>('');
  selectedSize = signal<string>('');
  quantity = signal<number>(1);

  isSizeGuideOpen = signal<boolean>(false);
  activeAccordion = signal<string>('details');
  addedMessage = signal<string | null>(null);

  readonly relatedProducts = computed(() => {
    const current = this.product();
    if (!current) return [];
    return MOCK_PRODUCTS.filter(p => p.id !== current.id).slice(0, 4);
  });

  readonly discountPercentage = computed(() => {
    const p = this.product();
    if (p && p.originalPrice && p.originalPrice > p.basePrice) {
      return Math.round(((p.originalPrice - p.basePrice) / p.originalPrice) * 100);
    }
    return null;
  });

  readonly availableColors = computed(() => {
    const p = this.product();
    if (!p) return [];
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
          hex: colorMap[v.color] || '#888888',
          imgUrl: v.garmentImageUrl
        });
      }
    });

    return colors;
  });

  readonly availableSizes = computed(() => {
    const p = this.product();
    if (!p) return [];
    const sizes = Array.from(new Set(p.variants.map(v => v.size)));
    return sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'];
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      const found = MOCK_PRODUCTS.find(p => p.slug === slug) || MOCK_PRODUCTS[0];
      this.product.set(found);

      if (found) {
        this.selectedImage.set(found.thumbnailUrl);
        this.selectedColor.set(found.variants[0]?.color || 'Tiêu chuẩn');
        this.selectedSize.set(found.variants[0]?.size || 'M');
        this.quantity.set(1);

        this.seo.updateSeo({
          title: `${found.name} | Fashion AI Studio`,
          description: found.description,
          keywords: `${found.name}, ${found.categoryName}, LifeWear, Thử đồ online`
        });
      }
    });
  }

  selectColor(color: { name: string; hex: string; imgUrl: string }): void {
    this.selectedColor.set(color.name);
    if (color.imgUrl) {
      this.selectedImage.set(color.imgUrl);
    }
  }

  selectSize(size: string): void {
    this.selectedSize.set(size);
  }

  adjustQuantity(delta: number): void {
    const newQty = Math.max(1, this.quantity() + delta);
    this.quantity.set(newQty);
  }

  toggleAccordion(section: string): void {
    this.activeAccordion.update(curr => (curr === section ? '' : section));
  }

  onAddToCart(): void {
    const p = this.product();
    if (!p) return;

    const matchedVariant = p.variants.find(
      v => v.color === this.selectedColor() && v.size === this.selectedSize()
    ) || p.variants[0];

    this.cartService.addItem(p, matchedVariant, this.quantity());
    this.addedMessage.set(`Đã thêm ${this.quantity()} sản phẩm vào giỏ hàng!`);
    setTimeout(() => {
      this.addedMessage.set(null);
    }, 2500);
  }

  onBuyNow(): void {
    this.onAddToCart();
    this.router.navigate(['/cart']);
  }

  onTryOnWithAi(): void {
    const p = this.product();
    if (!p) return;
    this.router.navigate(['/virtual-try-on'], {
      queryParams: {
        productId: p.id,
        color: this.selectedColor(),
        size: this.selectedSize()
      }
    });
  }
}
