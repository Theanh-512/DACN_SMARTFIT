import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContentCardComponent } from '../../../../shared/ui/content-card/content-card.component';
import { SectionHeaderComponent } from '../../../../shared/ui/section-header/section-header.component';

@Component({
  selector: 'app-home-feature-grid',
  standalone: true,
  imports: [CommonModule, ContentCardComponent, SectionHeaderComponent],
  templateUrl: './feature-grid.component.html',
  styleUrls: ['./feature-grid.component.scss']
})
export class HomeFeatureGridComponent {
  features = [
    {
      title: 'Angular SSR Siêu Tốc',
      subtitle: 'Prerendering tĩnh và Server-Side Rendering tối ưu hóa First Contentful Paint và SEO.',
      icon: '⚡',
      badge: 'Performance'
    },
    {
      title: 'Headless CMS Linh Hoạt',
      subtitle: 'Tích hợp chuẩn adapter giữa Strapi và Payload CMS trên Render Web Service.',
      icon: '🗄️',
      badge: 'Content'
    },
    {
      title: 'Hạ Tầng Firebase Edge CDN',
      subtitle: 'Phân phối tài nguyên tĩnh với bộ nhớ đệm bất biến (immutable cache) toàn cầu.',
      icon: '🚀',
      badge: 'DevOps'
    },
    {
      title: 'Kiến Trúc Modular Enterprise',
      subtitle: 'Phân tách Core, Features, Shared và Layout rõ ràng, dễ bảo trì và kiểm thử.',
      icon: '🧩',
      badge: 'Scalability'
    }
  ];
}
