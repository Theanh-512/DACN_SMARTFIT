import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-ui-conversion-banner',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './conversion-banner.component.html',
  styleUrls: ['./conversion-banner.component.scss']
})
export class ConversionBannerComponent {
  @Input() title = 'Sẵn Sàng Trải Nghiệm SmartFit Studio?';
  @Input() description = 'Đăng ký ngay hôm nay để nhận buổi tư vấn thể lực 1-on-1 và phân tích chỉ số InBody miễn phí.';
  @Input() ctaText = 'Đăng Ký Tư Vấn Ngay';
  @Output() ctaClicked = new EventEmitter<void>();

  onCtaClick(): void {
    this.ctaClicked.emit();
  }
}
