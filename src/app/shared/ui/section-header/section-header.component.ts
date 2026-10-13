import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-section-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-header.component.html',
  styleUrls: ['./section-header.component.scss']
})
export class SectionHeaderComponent {
  @Input() badge?: string;
  @Input() title = '';
  @Input() subtitle?: string;
  @Input() align: 'left' | 'center' | 'right' = 'center';
}
