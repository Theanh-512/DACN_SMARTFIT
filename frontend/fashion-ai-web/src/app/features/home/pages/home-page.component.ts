import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductStateService } from '../../../core/services/product-state.service';
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
  readonly productState = inject(ProductStateService);

  readonly allProducts = this.productState.products;
  readonly categories = this.productState.categories;
  readonly activeTab = signal<'featured' | 'new' | 'sale'>('featured');

  // Official Uniqlo Video Assets
  readonly heroVideoUrl = 'https://image.uniqlo.com/UQ/ST3/vn/imagesother/26FW_HomeAsset/WOMEN/PC.mp4';
  readonly jwaVideoUrl = 'https://image.uniqlo.com/UQ/CMS/video/jp/2026/HOME/GL_Aseets/PJ/JWA/jwa-w-2-1-movie-pc.mp4';
  readonly heattechVideoUrl = 'https://image.uniqlo.com/UQ/CMS/video/jp/2026/HOME/GL_Aseets/Campaign/Heattech/vn-Heattech-wm-movie-pc-2-1.mp4';
  readonly casualOuterVideoUrl = 'https://image.uniqlo.com/UQ/ST3/th/imagesother/00_WEB_L1L2/L1-Movie/26fw/women/home-pc_w-LWm-casualouter_adjusted.mp4';
  readonly jeansVideoUrl = 'https://image.uniqlo.com/UQ/ST3/vn/imagesother/26FW_HomeAsset/WOMEN/Jeans_Clean_16x9_WOMEN15sec.mp4';
  readonly uniqloCmsBannerImg = 'https://im.uniqlo.com/global-cms/spa/resa99572d7444d1cff9daf1e40c8c6a01efr.jpg';

  activeHeroVideo = signal<'pc' | 'jwa'>('pc');


  readonly airismProducts = computed(() => {
    return this.allProducts().filter(p => p.categoryId === 'cat-innerwear' || p.categoryId === 'cat-loungewear' || p.categoryId === 'cat-tshirts');
  });

  readonly outerwearProducts = computed(() => {
    return this.allProducts().filter(p => p.categoryId === 'cat-jackets' || p.categoryId === 'cat-fleece');
  });

  readonly denimProducts = computed(() => {
    return this.allProducts().filter(p => p.categoryId === 'cat-jeans' || p.categoryId === 'cat-pants');
  });

  readonly specialOfferProducts = computed(() => {
    return this.allProducts().filter(p => p.originalPrice && p.originalPrice > p.basePrice);
  });

  readonly displayedProducts = computed(() => {
    const list = this.allProducts();
    if (this.activeTab() === 'featured') {
      return list.filter(p => p.featured);
    }
    if (this.activeTab() === 'sale') {
      return list.filter(p => p.originalPrice && p.originalPrice > p.basePrice);
    }
    return list.slice(0, 8);
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
