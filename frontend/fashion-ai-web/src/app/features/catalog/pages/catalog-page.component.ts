import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Product } from '../models/product.model';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, Category } from '../../../core/data/mock-products';
import { CartService } from '../../../core/services/cart.service';
import { SeoService } from '../../../core/services/seo.service';
import { ProductStateService } from '../../../core/services/product-state.service';
import { ProductGridComponent } from '../../../shared/ui/product-grid/product-grid.component';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductGridComponent],
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.scss']
})
export class CatalogPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);
  readonly productState = inject(ProductStateService);

  readonly allProducts = this.productState.products;
  readonly categories = this.productState.categories;


  // Filters State
  selectedGender = signal<string>('all');
  selectedCategory = signal<string>('all');
  selectedSize = signal<string>('all');
  selectedColor = signal<string>('all');
  selectedPriceRange = signal<string>('all');
  onlyAiSupported = signal<boolean>(false);
  sortBy = signal<string>('newest');
  isMobileFilterOpen = signal<boolean>(false);

  // Available Filter Options
  readonly availableSizes = ['XS', 'S', 'M', 'L', 'XL', '26', '27', '28', '30', '31'];
  readonly availableColors = [
    { name: 'Đen', hex: '#111111' },
    { name: 'Trắng', hex: '#ffffff' },
    { name: 'Beige', hex: '#e6decb' },
    { name: 'Xanh Nhạt', hex: '#93c5fd' },
    { name: 'Xanh Rêu', hex: '#4d5d53' },
    { name: 'Navy', hex: '#1e293b' }
  ];

  readonly filteredProducts = computed(() => {
    let list = this.allProducts();

    // Gender filter
    if (this.selectedGender() !== 'all') {
      const g = this.selectedGender();
      list = list.filter(p => {
        const cat = this.categories().find(c => c.id === p.categoryId);
        return cat?.gender === g || cat?.gender === 'unisex';
      });
    }

    // Category filter
    if (this.selectedCategory() !== 'all') {
      list = list.filter(p => p.categoryId === this.selectedCategory());
    }

    // Size filter
    if (this.selectedSize() !== 'all') {
      list = list.filter(p => p.variants.some(v => v.size === this.selectedSize()));
    }

    // Color filter
    if (this.selectedColor() !== 'all') {
      list = list.filter(p => p.variants.some(v => v.color === this.selectedColor()));
    }

    // Price filter
    if (this.selectedPriceRange() !== 'all') {
      if (this.selectedPriceRange() === 'under500') {
        list = list.filter(p => p.basePrice < 500000);
      } else if (this.selectedPriceRange() === '500to1000') {
        list = list.filter(p => p.basePrice >= 500000 && p.basePrice <= 1000000);
      } else if (this.selectedPriceRange() === 'above1000') {
        list = list.filter(p => p.basePrice > 1000000);
      }
    }

    // AI supported filter
    if (this.onlyAiSupported()) {
      list = list.filter(p => p.variants.some(v => !!v.garmentImageUrl));
    }

    // Sorting
    return [...list].sort((a, b) => {
      if (this.sortBy() === 'price-asc') return a.basePrice - b.basePrice;
      if (this.sortBy() === 'price-desc') return b.basePrice - a.basePrice;
      if (this.sortBy() === 'name-asc') return a.name.localeCompare(b.name);
      return 0; // Default newest
    });
  });

  addedMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Tất Cả Sản Phẩm Thời Trang | Fashion AI Studio',
      description: 'Lọc và tìm kiếm trang phục thời trang LifeWear tối giản. Hỗ trợ thử đồ ảo AI tức thì.',
      keywords: 'Thời trang, áo, quần, đầm, thử đồ online, LifeWear'
    });

    // Read query params if any
    this.route.queryParams.subscribe(params => {
      if (params['gender']) this.selectedGender.set(params['gender']);
      if (params['category']) this.selectedCategory.set(params['category']);
      if (params['q']) {
        const query = params['q'].toLowerCase();
        this.allProducts.set(
          MOCK_PRODUCTS.filter(p =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
          )
        );
      }
    });
  }

  resetFilters(): void {
    this.selectedGender.set('all');
    this.selectedCategory.set('all');
    this.selectedSize.set('all');
    this.selectedColor.set('all');
    this.selectedPriceRange.set('all');
    this.onlyAiSupported.set(false);
    this.sortBy.set('newest');
    this.allProducts.set(MOCK_PRODUCTS);
  }

  toggleMobileFilter(): void {
    this.isMobileFilterOpen.update(v => !v);
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
