import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../../core/services/seo.service';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import { ContentCardComponent } from '../../../shared/ui/content-card/content-card.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

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
      title: 'Giới Thiệu - FashionAI E-Commerce',
      description: 'Nền tảng thời trang thông minh ứng dụng AI Virtual Try-On và Visual Search hiện đại.',
      keywords: 'FashionAI, Giới thiệu, Virtual Try-On, Visual Search, AI E-commerce'
    });
  }
}
