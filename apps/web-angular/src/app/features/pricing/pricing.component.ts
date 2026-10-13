import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { MOCK_PRICING_PLANS, PricingPlan } from '../../core/data/mock-services';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ButtonComponent],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);

  plans: PricingPlan[] = MOCK_PRICING_PLANS;

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Bảng Giá Dịch Vụ - SmartFit Studio',
      description: 'Bảng giá gói tập luyện SmartFit Studio: Cơ bản, Pro Studio và Elite VIP.',
      keywords: 'Bảng giá gym, Gói tập SmartFit Studio'
    });
  }

  selectPlan(plan: PricingPlan): void {
    this.router.navigate(['/contact'], { queryParams: { plan: plan.id } });
  }
}
