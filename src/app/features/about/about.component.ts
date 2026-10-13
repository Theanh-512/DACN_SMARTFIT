import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { SectionHeaderComponent } from '../../shared/ui/section-header/section-header.component';
import { ContentCardComponent } from '../../shared/ui/content-card/content-card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterLink, SectionHeaderComponent, ContentCardComponent, ButtonComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss']
})
export class AboutComponent implements OnInit {
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Giới Thiệu - SmartFit Studio',
      description: 'Khám phá kiến trúc phân tầng Enterprise của SmartFit Studio.',
      keywords: 'SmartFit Studio, Giới thiệu, Kiến trúc, Angular SSR'
    });
  }
}
