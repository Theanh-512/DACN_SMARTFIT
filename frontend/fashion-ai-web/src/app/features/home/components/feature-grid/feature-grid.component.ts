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
      title: 'Thử Đồ Ảo IDM-VTON',
      subtitle: 'Mô hình khuếch tán tiên tiến giữ nguyên nếp vải và form dáng trang phục chân thực trên ảnh cơ thể bạn.',
      icon: '✨',
      badge: 'Virtual Try-On'
    },
    {
      title: 'Tìm Kiếm SigLIP + FAISS',
      subtitle: 'Trích xuất vector embedding đa phương thức và tìm kiếm tương đồng tức thì trong hàng chục ngàn sản phẩm.',
      icon: '📷',
      badge: 'Visual Search'
    },
    {
      title: 'Backend ASP.NET Core 9',
      subtitle: 'Clean Architecture, Entity Framework Core và SQL Server đảm bảo tính toàn vẹn giao dịch và tồn kho.',
      icon: '🏛️',
      badge: 'Clean Architecture'
    },
    {
      title: 'Angular 20 & Hybrid SSR',
      subtitle: 'Kết hợp Prerender tĩnh cho SEO sản phẩm và Client Hydration cho tính năng thử đồ tương tác cao.',
      icon: '⚡',
      badge: 'Performance'
    }
  ];
}
