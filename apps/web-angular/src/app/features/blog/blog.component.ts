import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { ContentCardComponent } from '../../shared/ui/content-card/content-card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';

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
      title: 'Tối Ưu Hoá Tốc Độ Với Angular SSR & Edge CDN',
      slug: 'angular-ssr-edge-cdn',
      date: '12 Tháng 10, 2026',
      category: 'Công Nghệ',
      excerpt: 'Khám phá cách thức kết hợp Server-Side Rendering và CDN Edge giúp giảm thời gian phản hồi máy chủ xuống dưới 50ms.'
    },
    {
      id: '2',
      title: 'Ứng Dụng AI Trong Đo Lường Sinh Trắc Học Cá Nhân',
      slug: 'ai-biometrics-tracking',
      date: '08 Tháng 10, 2026',
      category: 'Thể Thao & AI',
      excerpt: 'Công nghệ phân tích chuyển động giúp huấn luyện viên phát hiện sai sót trong kỹ thuật tập luyện lập tức.'
    },
    {
      id: '3',
      title: 'Chiến Lược Quản Lý Nội Dung Với Headless CMS',
      slug: 'headless-cms-strategy',
      date: '02 Tháng 10, 2026',
      category: 'Kiến Trúc',
      excerpt: 'So sánh giữa Strapi và Payload CMS khi tích hợp vào kiến trúc Micro-Frontend hiện đại.'
    }
  ];

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Blog & Tin Tức - SmartFit Studio',
      description: 'Tổng hợp các bài viết chuyên sâu về công nghệ thể thao, kiến trúc Angular SSR và trí tuệ nhân tạo.',
      keywords: 'Blog SmartFit, Tin tức công nghệ thể thao, Angular SSR'
    });
  }
}
