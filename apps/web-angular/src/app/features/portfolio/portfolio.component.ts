import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { ContentCardComponent } from '../../shared/ui/content-card/content-card.component';

interface ProjectCase {
  title: string;
  category: string;
  metric: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ContentCardComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit {
  private readonly seo = inject(SeoService);

  cases: ProjectCase[] = [
    {
      title: 'Chuyển Đổi Số Chuỗi 10 Phòng Gym FitPro',
      category: 'Enterprise IoT',
      metric: '+45% Tỷ Lệ Giữ Chân Hội Viên',
      description: 'Triển khai hạ tầng serverless và ứng dụng di động đo lường thể chất cho 15.000 hội viên đang hoạt động.',
      icon: '🏆'
    },
    {
      title: 'Hệ Thống Phân Tích Dữ Liệu Vận Động Elite Athlete',
      category: 'AI Analytics',
      metric: 'Giảm 60% Nguy Cơ Chấn Thương',
      description: 'Mô hình AI dự đoán quá tải cơ bắp dựa trên nhịp tim và tải trọng bài tập hàng ngày.',
      icon: '🔬'
    },
    {
      title: 'Nền Tảng Đặt Lịch & Huấn Luyện Từ Xa SmartCoach',
      category: 'Web App SSR',
      metric: 'Tốc Độ Tải Trang < 0.8s',
      description: 'Ứng dụng Angular SSR tích hợp CMS quản trị nội dung video bài tập và tài liệu dinh dưỡng đa ngôn ngữ.',
      icon: '🌐'
    }
  ];

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Dự Án Đã Triển Khai - SmartFit Studio',
      description: 'Các case study thành công về chuyển đổi số thể thao và trung tâm thể hình của SmartFit Studio.',
      keywords: 'Dự án SmartFit, Case study gym, Chuyển đổi số thể thao'
    });
  }
}
