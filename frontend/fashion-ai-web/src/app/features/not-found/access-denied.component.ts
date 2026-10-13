import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss']
})
export class AccessDeniedComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  switchToAdmin(): void {
    this.authService.switchRole('admin');
    this.router.navigate(['/admin']);
  }
}
