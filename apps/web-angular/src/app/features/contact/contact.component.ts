import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { ContactFormComponent, ContactFormData } from '../../shared/ui/contact-form/contact-form.component';
import { BRAND_VOICE } from '../../core/content/brand-voice';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ContactFormComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  private readonly seo = inject(SeoService);
  readonly brand = BRAND_VOICE;

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Liên Hệ - SmartFit Studio',
      description: 'Liên hệ tư vấn dịch vụ rèn luyện thể chất thông minh và trải nghiệm giải pháp phòng tập SmartFit.',
      keywords: 'Liên hệ SmartFit, Hotline SmartFit Studio'
    });
  }

  handleFormSubmission(data: ContactFormData): void {
    console.log('Customer Lead Data Submitted:', data);
  }
}
