import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../../core/services/seo.service';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import { ContentCardComponent } from '../../../shared/ui/content-card/content-card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  date: string;
  category: string;
  excerpt: string;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ContentCardComponent, ButtonComponent],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  private readonly seo = inject(SeoService);

  posts: BlogPost[] = [
    {
      id: '1',
      title: 'Công Nghệ AI Virtual Try-On Thay Đổi Ngành Thời Trang Như Thế Nào?',
      slug: 'ai-virtual-try-on-fashion',
      date: '12 Tháng 10, 2026',
      category: 'Công Nghệ AI',
      excerpt: 'Khám phá kiến trúc mô hình IDM-VTON kết hợp mô hình khuếch tán giúp khách hàng thử đồ ảo trực tiếp với độ chân thực vượt trội.'
    },
    {
      id: '2',
      title: 'Tìm Kiếm Bằng Hình Ảnh Với SigLIP & FAISS Index',
      slug: 'visual-search-siglip-faiss',
      date: '08 Tháng 10, 2026',
      category: 'Visual Search',
      excerpt: 'Hướng dẫn xây dựng hệ thống gợi ý trang phục thông minh thông qua vector embedding và tìm kiếm lân cận tốc độ cao.'
    },
    {
      id: '3',
      title: 'Tối Ưu Trải Nghiệm E-Commerce Với Angular SSR & ASP.NET Core Web API',
      slug: 'fullstack-ecommerce-architecture',
      date: '02 Tháng 10, 2026',
      category: 'Kiến Trúc Hệ Thống',
      excerpt: 'Cách triển khai mô hình Clean Architecture cho hệ thống bán lẻ thời trang có khả năng chịu tải cao.'
    }
  ];

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Blog & Tin Tức Công Nghệ - FashionAI',
      description: 'Cập nhật tin tức và bài viết chuyên sâu về AI thời trang, Virtual Try-On và Visual Search.',
      keywords: 'Blog FashionAI, Virtual Try-On AI, SigLIP FAISS, AI Fashion'
    });
  }
}
