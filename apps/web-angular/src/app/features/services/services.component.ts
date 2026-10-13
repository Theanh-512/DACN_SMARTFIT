import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { ContentCardComponent } from '../../shared/ui/content-card/content-card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { MOCK_SERVICES, ServiceItem } from '../../core/data/mock-services';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ContentCardComponent, ButtonComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);

  servicesList: ServiceItem[] = MOCK_SERVICES;

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Dịch Vụ - SmartFit Studio',
      description: 'Khám phá các giải pháp rèn luyện thể chất thông minh: Smart Tracking AI, HLV 1-on-1, Hybrid Studio.',
      keywords: 'Dịch vụ gym, SmartFit Studio, AI Workout'
    });
  }

  consultService(service: ServiceItem): void {
    this.router.navigate(['/contact'], { queryParams: { service: service.slug } });
  }
}
