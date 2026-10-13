import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../../core/services/seo.service';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';

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
      question: 'Tính năng Thử đồ ảo (Virtual Try-On) hoạt động như thế nào?',
      answer: 'Chúng tôi sử dụng mô hình học sâu IDM-VTON chạy trên cụm GPU. Khách hàng chỉ cần tải ảnh chân dung hoặc toàn thân và chọn trang phục mong muốn. AI sẽ tự động phân tích vóc dáng và ghép trang phục với nếp gấp và ánh sáng chân thực trong vòng 3-5 giây.',
      open: true
    },
    {
      question: 'Hình ảnh cá nhân của tôi có được bảo mật và an toàn không?',
      answer: 'Tất cả ảnh tải lên chỉ được xử lý tạm thời trong phiên thử đồ và được mã hóa lưu trữ trên cụm MinIO S3 an toàn. Hệ thống tự động xóa dữ liệu sau 24 giờ và tuyệt đối không chia sẻ ảnh cho bên thứ ba.',
      open: false
    },
    {
      question: 'Tìm kiếm bằng hình ảnh (Visual Search) hoạt động ra sao?',
      answer: 'Mô hình SigLIP trích xuất vector embedding đa phương thức từ hình ảnh bạn tải lên và đối soát qua chỉ mục FAISS với hàng chục nghìn sản phẩm thời trang trong kho để gợi ý các mẫu giống và phong cách tương đồng nhất.',
      open: false
    },
    {
      question: 'Chính sách đổi trả sản phẩm khi mua sắm tại FashionAI là gì?',
      answer: 'FashionAI hỗ trợ đổi hàng miễn phí trong vòng 7 ngày nếu sản phẩm không vừa kích cỡ hoặc có lỗi từ nhà sản xuất. Bạn có thể sử dụng Virtual Try-On trước khi mua để hạn chế tối đa việc chọn nhầm size.',
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
      title: 'FAQ - Câu Hỏi Thường Gặp | FashionAI',
      description: 'Giải đáp các thắc mắc về tính năng Thử đồ ảo (Virtual Try-On), Tìm kiếm hình ảnh (Visual Search) và mua sắm tại FashionAI.',
      keywords: 'FAQ FashionAI, Thử đồ ảo AI, Tìm kiếm hình ảnh thời trang'
    });
  }
}
