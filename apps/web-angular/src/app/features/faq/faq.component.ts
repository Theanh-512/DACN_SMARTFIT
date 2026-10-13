import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';

interface FaqItem {
  question: string;
  answer: string;
  open?: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  private readonly seo = inject(SeoService);

  faqList = signal<FaqItem[]>([
    {
      question: 'SmartFit Studio áp dụng công nghệ gì trong luyện tập?',
      answer: 'Chúng tôi tích hợp cảm biến IoT thời gian thực, đo đạc chỉ số cơ học bằng AI, kết hợp cùng hệ thống Dashboard theo dõi lộ trình thể chất toàn diện.',
      open: true
    },
    {
      question: 'Dữ liệu thành viên được lưu trữ và bảo mật thế nào?',
      answer: 'Hệ thống tuân thủ tiêu chuẩn an toàn bảo mật dữ liệu, cơ sở dữ liệu được mã hoá và lưu trữ trên Managed Postgres có sao lưu định kỳ tự động.',
      open: false
    },
    {
      question: 'Tôi có thể đổi lịch tập với huấn luyện viên cá nhân không?',
      answer: 'Có, bạn có thể chủ động thay đổi lịch tập linh hoạt thông qua ứng dụng di động trước tối thiểu 4 tiếng so với giờ tập dự kiến.',
      open: false
    },
    {
      question: 'SmartFit có chính sách trải nghiệm thử không?',
      answer: 'Khách hàng mới được tặng 01 buổi trải nghiệm miễn phí gồm phân tích InBody chuyên sâu và 45 phút hướng dẫn 1-on-1 cùng huấn luyện viên.',
      open: false
    }
  ]);

  toggleFaq(index: number): void {
    this.faqList.update(list =>
      list.map((item, i) => (i === index ? { ...item, open: !item.open } : item))
    );
  }

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'FAQ - Câu Hỏi Thường Gặp | SmartFit Studio',
      description: 'Giải đáp các thắc mắc về lộ trình luyện tập, gói dịch vụ và nền tảng công nghệ SmartFit Studio.',
      keywords: 'FAQ SmartFit Studio, Câu hỏi thường gặp'
    });
  }
}
