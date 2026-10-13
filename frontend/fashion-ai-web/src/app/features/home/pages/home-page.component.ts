import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { CartService } from '../../../core/services/cart.service';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../../core/data/mock-products';
import { Product } from '../../catalog/models/product.model';
import { ProductGridComponent } from '../../../shared/ui/product-grid/product-grid.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductGridComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  readonly allProducts = signal<Product[]>(MOCK_PRODUCTS);
  readonly categories = signal(MOCK_CATEGORIES);
  readonly activeTab = signal<'featured' | 'new' | 'sale'>('featured');

  readonly displayedProducts = computed(() => {
    const list = this.allProducts();
    if (this.activeTab() === 'featured') {
      return list.filter(p => p.featured);
    }
    if (this.activeTab() === 'sale') {
      return list.filter(p => p.originalPrice && p.originalPrice > p.basePrice);
    }
    return list.slice(0, 6);
  });

  addedMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Fashion AI Studio | Thời Trang Tối Giản & Thử Đồ Ảo AI 2026',
      description: 'Nền tảng thương mại điện tử thời trang LifeWear ứng dụng IDM-VTON Virtual Try-On và SigLIP Visual Search.',
      keywords: 'Thời trang nam nữ, thử đồ online, Virtual Try-on, Visual Search, AI E-commerce'
    });
  }

  setTab(tab: 'featured' | 'new' | 'sale'): void {
    this.activeTab.set(tab);
  }

  onTryOn(product: Product): void {
    this.router.navigate(['/virtual-try-on'], {
      queryParams: { productId: product.id }
    });
  }

  onAddToCart(product: Product): void {
    this.cartService.addItem(product);
    this.addedMessage.set(`Đã thêm "${product.name}" vào giỏ hàng!`);
    setTimeout(() => {
      this.addedMessage.set(null);
    }, 2500);
  }
}
