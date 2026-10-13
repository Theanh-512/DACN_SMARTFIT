import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-site-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  private readonly router = inject(Router);
  readonly cartService = inject(CartService);

  isMenuOpen = signal(false);
  searchQuery = signal('');

  toggleMenu(): void {
    this.isMenuOpen.update(v => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  onSearchSubmit(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/catalog'], { queryParams: { q } });
      this.closeMenu();
    }
  }

  openVisualSearch(): void {
    this.router.navigate(['/visual-search']);
    this.closeMenu();
  }
}
