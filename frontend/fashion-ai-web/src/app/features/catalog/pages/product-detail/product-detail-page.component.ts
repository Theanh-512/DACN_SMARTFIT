import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product, ProductVariant } from '../../models/product.model';
import { MOCK_PRODUCTS } from '../../../../core/data/mock-products';
import { CartService } from '../../../../core/services/cart.service';
import { SeoService } from '../../../../core/services/seo.service';
import { ProductStateService } from '../../../../core/services/product-state.service';
import { ProductGridComponent } from '../../../../shared/ui/product-grid/product-grid.component';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';

import { FormsModule } from '@angular/forms';
import { SizeRecommendationService, SizeRecommendationResult } from '../../../../core/services/size-recommendation.service';

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductGridComponent, ModalComponent],
  templateUrl: './product-detail-page.component.html',
  styleUrls: ['./product-detail-page.component.scss']
})
export class ProductDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly sizeService = inject(SizeRecommendationService);
  readonly cartService = inject(CartService);
  readonly productState = inject(ProductStateService);

  product = signal<Product | null>(null);
  selectedImage = signal<string>('');
  selectedColor = signal<string>('');
  selectedSize = signal<string>('');
  quantity = signal<number>(1);

  isSizeGuideOpen = signal<boolean>(false);
  activeAccordion = signal<string>('details');
  addedMessage = signal<string | null>(null);

  // Size Recommendation State
  userHeight = signal<number>(170);
  userWeight = signal<number>(65);
  userChest = signal<number | null>(null);
  userWaist = signal<number | null>(null);
  userFitPref = signal<'slim' | 'regular' | 'relaxed'>('regular');
  sizeRecommendation = signal<SizeRecommendationResult | null>(null);
  isCalculatingSize = signal<boolean>(false);

  readonly relatedProducts = computed(() => {
    const current = this.product();
    if (!current) return [];
    return this.productState.products().filter(p => p.id !== current.id).slice(0, 4);
  });


  readonly discountPercentage = computed(() => {
    const p = this.product();
    if (p && p.originalPrice && p.originalPrice > p.basePrice) {
      return Math.round(((p.originalPrice - p.basePrice) / p.originalPrice) * 100);
    }
    return null;
  });

  activeMediaTab = signal<'photos' | 'video'>('photos');

  readonly reviewsList = computed(() => {
    return this.product()?.reviews || [];
  });

  readonly styleHintList = computed(() => {
    const p = this.product();
    if (p?.styleHintImages && p.styleHintImages.length > 0) {
      return p.styleHintImages;
    }
    return [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80'
    ];
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
      'Kem Trắng': '#faf6ee',
      '09 BLACK': '#111111',
      '01 OFF WHITE': '#f8fafc',
      '57 OLIVE': '#4d5d53',
      '69 NAVY': '#1e293b',
      '31 BEIGE': '#e2d7c5',
      '32 BEIGE': '#d4b996',
      '00 WHITE': '#ffffff',
      '64 BLUE LIGHT': '#93c5fd',
      '68 BLUE DARK': '#1e3a8a',
      '08 DARK GRAY': '#4b5563',
      '60 LIGHT BLUE': '#bae6fd'
    };

    const seen = new Set<string>();
    const colors: { name: string; hex: string; imgUrl: string; colorCode: string }[] = [];

    p.variants.forEach(v => {
      const code = v.colorCode || v.color;
      if (!seen.has(code)) {
        seen.add(code);
        colors.push({
          name: code,
          colorCode: code,
          hex: v.colorHex || colorMap[code] || colorMap[v.color] || '#888888',
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
      const found = this.productState.products().find(p => p.slug === slug) || this.productState.products()[0];
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

  calculateSizeRecommendation(): void {
    const p = this.product();
    if (!p) return;

    this.isCalculatingSize.set(true);
    this.sizeService.recommend(
      p.categoryId,
      this.userFitPref(),
      {
        heightCm: this.userHeight(),
        weightKg: this.userWeight(),
        chestCm: this.userChest() || undefined,
        waistCm: this.userWaist() || undefined
      }
    ).subscribe({
      next: (res) => {
        this.sizeRecommendation.set(res);
        this.isCalculatingSize.set(false);
      },
      error: () => {
        this.isCalculatingSize.set(false);
      }
    });
  }

  applyRecommendedSize(size: string): void {
    this.selectedSize.set(size);
    this.isSizeGuideOpen.set(false);
    this.addedMessage.set(`Đã chọn kích cỡ khuyến nghị ${size} theo số đo của bạn!`);
    setTimeout(() => {
      this.addedMessage.set(null);
    }, 2500);
  }
}
