import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../../core/services/seo.service';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import { ContactFormComponent, ContactFormData } from '../../../shared/ui/contact-form/contact-form.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ContactFormComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly brand = {
    tagline: 'Trải nghiệm thời trang mua sắm thế hệ mới cùng AI Virtual Try-On & Visual Search',
    contact: {
      address: 'Khu Công Nghệ Cao TP.HCM, Quận 9, TP. Thủ Đức',
      hotline: '1900 6868',
      email: 'support@fashionai.vn'
    }
  };

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Liên Hệ & Hỗ Trợ - FashionAI',
      description: 'Liên hệ đội ngũ chăm sóc khách hàng và hỗ trợ kỹ thuật của FashionAI E-Commerce.',
      keywords: 'Liên hệ FashionAI, Hỗ trợ khách hàng, Hotline FashionAI'
    });
  }

  handleFormSubmission(data: ContactFormData): void {
    console.log('Customer Lead Data Submitted:', data);
  }
}
