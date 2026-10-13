import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { CartService } from '../../../core/services/cart.service';
import { MOCK_PRODUCTS } from '../../../core/data/mock-products';
import { Product } from '../../catalog/models/product.model';

export interface VisualSearchResultItem {
  product: Product;
  similarityScore: number; // e.g. 0.965
}

@Component({
  selector: 'app-visual-search-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './visual-search-page.component.html',
  styleUrls: ['./visual-search-page.component.scss']
})
export class VisualSearchPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  // Sample Query Images for 1-click testing
  readonly sampleQueryImages = [
    {
      title: 'Áo Blazer Công Sở',
      url: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Áo Thun Trắng Basic',
      url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80'
    },
    {
      title: 'Đầm Liền Dạ Hội',
      url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=600&q=80'
    }
  ];

  queryImageUrl = signal<string | null>(this.sampleQueryImages[0].url);
  isSearching = signal<boolean>(false);
  searchResults = signal<VisualSearchResultItem[]>([]);
  searchTimeMs = signal<number>(142);

  get matchedProducts(): Product[] {
    return this.searchResults().map(r => r.product);
  }

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Tìm Kiếm Bằng Hình Ảnh (SigLIP + FAISS) | Fashion AI Studio',
      description: 'Chụp hoặc tải ảnh trang phục bạn yêu thích, hệ thống SigLIP vector embedding tìm kiếm trang phục tương tự trong kho tức thì.',
      keywords: 'Tìm kiếm bằng ảnh, SigLIP, FAISS, Visual search, AI fashion'
    });

    // Run initial search with sample image
    this.runSearch();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.queryImageUrl.set(URL.createObjectURL(file));
      this.runSearch();
    }
  }

  selectSample(url: string): void {
    this.queryImageUrl.set(url);
    this.runSearch();
  }

  runSearch(): void {
    if (!this.queryImageUrl()) return;

    this.isSearching.set(true);

    // Simulate SigLIP multimodal embeddings + FAISS cosine similarity search
    setTimeout(() => {
      this.isSearching.set(false);
      this.searchTimeMs.set(Math.floor(120 + Math.random() * 80));

      this.searchResults.set([
        { product: MOCK_PRODUCTS[0], similarityScore: 0.968 },
        { product: MOCK_PRODUCTS[7], similarityScore: 0.892 },
        { product: MOCK_PRODUCTS[5], similarityScore: 0.845 },
        { product: MOCK_PRODUCTS[2], similarityScore: 0.781 }
      ]);
    }, 1200);
  }

  onTryOn(product: Product): void {
    this.router.navigate(['/virtual-try-on'], {
      queryParams: { productId: product.id }
    });
  }

  onAddToCart(product: Product): void {
    this.cartService.addItem(product);
  }
}
