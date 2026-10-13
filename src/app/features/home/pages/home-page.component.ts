import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HomeHeroComponent } from '../components/hero/hero.component';
import { HomeFeatureGridComponent } from '../components/feature-grid/feature-grid.component';
import { ConversionBannerComponent } from '../../../shared/ui/conversion-banner/conversion-banner.component';
import { SeoService } from '../../../core/services/seo.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, HomeHeroComponent, HomeFeatureGridComponent, ConversionBannerComponent],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'SmartFit Studio - Trang Chủ',
      description: 'Nền tảng thể thao thông minh chuẩn Enterprise xây dựng trên Angular SSR, Firebase và Headless CMS.',
      keywords: 'SmartFit Studio, Angular SSR, Firebase Hosting, Strapi, Payload CMS'
    });
  }

  handleCtaClick(): void {
    this.router.navigate(['/contact']);
  }
}
