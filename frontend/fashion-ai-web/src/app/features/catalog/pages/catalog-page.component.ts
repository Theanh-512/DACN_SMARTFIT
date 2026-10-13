import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../models/product.model';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { ContentCardComponent } from '../../../shared/ui/content-card/content-card.component';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeaderComponent, ButtonComponent, ContentCardComponent],
  templateUrl: './catalog-page.component.html',
  styleUrls: ['./catalog-page.component.scss']
})
export class CatalogPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  products = signal<Product[]>([
    {
      id: 'p-1',
      name: 'Áo Blazer Oversize Thanh Lịch',
      slug: 'ao-blazer-oversize',
      description: 'Chất liệu len pha cao cấp, form dáng suông hiện đại tôn dáng chuẩn châu Á.',
      categoryId: 'c-1',
      categoryName: 'Áo Khoác',
      basePrice: 850000,
      originalPrice: 1100000,
      thumbnailUrl: '',
      images: [],
      variants: [],
      inStock: true
    },
    {
      id: 'p-2',
      name: 'Đầm Maxi Lụa Satin Dáng Xòe',
      slug: 'dam-maxi-lua-satin',
      description: 'Thiết kế lụa satin mềm mại, óng ánh tự nhiên, đường may thủ công sắc nét.',
      categoryId: 'c-2',
      categoryName: 'Đầm Liền',
      basePrice: 1250000,
      originalPrice: 1500000,
      thumbnailUrl: '',
      images: [],
      variants: [],
      inStock: true
    },
    {
      id: 'p-3',
      name: 'Áo Sơ Mi Lụa Cổ V Minimalist',
      slug: 'ao-so-mi-lua-co-v',
      description: 'Phong cách tối giản công sở, thoáng khí và ít nhăn phù hợp mặc hàng ngày.',
      categoryId: 'c-3',
      categoryName: 'Áo Sơ Mi',
      basePrice: 480000,
      originalPrice: 600000,
      thumbnailUrl: '',
      images: [],
      variants: [],
      inStock: true
    }
  ]);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Bộ Sưu Tập Thời Trang - FashionAI Studio',
      description: 'Khám phá các thiết kế thời trang hiện đại kết hợp thử đồ ảo AI trên cơ thể bạn.',
      keywords: 'Thời trang nữ, áo blazer, đầm maxi, thử đồ online'
    });
  }
}
