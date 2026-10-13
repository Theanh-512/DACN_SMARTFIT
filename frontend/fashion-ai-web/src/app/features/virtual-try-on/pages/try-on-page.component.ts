import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SectionHeaderComponent } from '../../../shared/ui/section-header/section-header.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { SeoService } from '../../../core/services/seo.service';
import { TryOnTaskStatus } from '../models/try-on.model';

@Component({
  selector: 'app-try-on-page',
  standalone: true,
  imports: [CommonModule, SectionHeaderComponent, ButtonComponent],
  templateUrl: './try-on-page.component.html',
  styleUrls: ['./try-on-page.component.scss']
})
export class TryOnPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);

  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  taskStatus = signal<TryOnTaskStatus>('Pending');
  isProcessing = signal(false);
  resultImageUrl = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Phòng Thử Đồ Ảo AI - IDM-VTON | FashionAI Studio',
      description: 'Trải nghiệm thử trang phục ảo tức thì trên ảnh toàn thân của bạn với công nghệ AI Diffusion Model.',
      keywords: 'Thử đồ online, virtual try-on, AI fashion, IDM-VTON'
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile.set(file);
      this.previewUrl.set(URL.createObjectURL(file));
      this.resultImageUrl.set(null);
    }
  }

  startTryOn(): void {
    if (!this.selectedFile()) return;

    this.isProcessing.set(true);
    this.taskStatus.set('Processing');

    // Simulate async pipeline task
    setTimeout(() => {
      this.isProcessing.set(false);
      this.taskStatus.set('Success');
      this.resultImageUrl.set(this.previewUrl());
    }, 2000);
  }
}
