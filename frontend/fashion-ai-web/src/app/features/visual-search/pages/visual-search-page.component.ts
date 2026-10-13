import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ContentCardComponent } from '../../../shared/ui/content-card/content-card.component';
import { SeoService } from '../../../core/services/seo.service';
import { VisualSearchMatch } from '../models/visual-search.model';

@Component({
  selector: 'app-visual-search-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeaderComponent, ButtonComponent, ContentCardComponent],
  templateUrl: './visual-search-page.component.html',
  styleUrls: ['./visual-search-page.component.scss']
})
export class VisualSearchPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  previewUrl = signal<string | null>(null);
  isSearching = signal(false);
  searchResults = signal<VisualSearchMatch[]>([]);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Tìm Kiếm Bằng Hình Ảnh (SigLIP + FAISS) | FashionAI Studio',
      description: 'Chụp hoặc tải ảnh mẫu trang phục bạn yêu thích, AI sẽ tìm kiếm các sản phẩm tương đồng tức thì.',
      keywords: 'Tìm kiếm bằng ảnh, Visual search, SigLIP, FAISS, AI fashion'
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.previewUrl.set(URL.createObjectURL(file));
      this.performSearch();
    }
  }

  performSearch(): void {
    this.isSearching.set(true);

    // Simulate SigLIP vector embedding + FAISS index search
    setTimeout(() => {
      this.isSearching.set(false);
      this.searchResults.set([
        {
          productId: 'p-1',
          name: 'Áo Blazer Oversize Thanh Lịch',
          price: 850000,
          thumbnailUrl: '',
          similarityScore: 0.942
        },
        {
          productId: 'p-3',
          name: 'Áo Sơ Mi Lụa Cổ V Minimalist',
          price: 480000,
          thumbnailUrl: '',
          similarityScore: 0.887
        }
      ]);
    }, 1500);
  }
}
