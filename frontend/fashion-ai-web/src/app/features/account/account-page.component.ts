import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { AuthService } from '../../core/auth/auth.service';
import { ProductStateService } from '../../core/services/product-state.service';

interface MockOrder {
  id: string;
  orderCode: string;
  date: string;
  itemsCount: number;
  total: number;
  status: 'Chờ xử lý' | 'Đang chuẩn bị' | 'Đang giao hàng' | 'Đã giao' | 'Đã hủy';
}

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './account-page.component.html',
  styleUrls: ['./account-page.component.scss']
})
export class AccountPageComponent implements OnInit {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly authService = inject(AuthService);
  readonly productState = inject(ProductStateService);

  authTab = signal<'login' | 'register'>('login');
  accountActiveTab = signal<'profile' | 'orders' | 'ai-history'>('profile');

  // Form Models
  loginEmail = signal('customer@fashionai.com');
  loginPassword = signal('••••••••');
  regFullName = signal('');
  regEmail = signal('');
  regPassword = signal('');

  // Editable Profile
  userFullName = signal('Nguyễn Thế Anh');
  userPhone = signal('0988 123 456');
  userAddress = signal('Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh');
  userHeightCm = signal(175);
  userWeightKg = signal(68);
  userPreferredSize = signal('L');

  // Notice Message
  profileMessage = signal<string | null>(null);
  authNotice = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Tài Khoản & Phân Quyền | Fashion AI Studio',
      description: 'Quản lý thông tin tài khoản, vai trò đăng nhập (Admin / Người Xem), số đo cơ thể AI và đơn hàng.',
      keywords: 'Tài khoản, phân quyền, vai trò, số đo AI, đơn hàng'
    });

    // Check query params for redirected errors
    this.route.queryParams.subscribe(params => {
      if (params['error'] === 'admin_required') {
        this.authNotice.set('⚠️ Trang Quản Trị yêu cầu đăng nhập bằng tài khoản Quản Trị Viên (Role: Admin).');
      }
    });

    const user = this.authService.currentUser();
    if (user) {
      this.userFullName.set(user.fullName || user.username);
      this.userPhone.set(user.phone || '0988 123 456');
      this.userAddress.set(user.address || 'Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh');
      if (user.heightCm) this.userHeightCm.set(user.heightCm);
      if (user.weightKg) this.userWeightKg.set(user.weightKg);
      if (user.preferredSize) this.userPreferredSize.set(user.preferredSize);
    }
  }

  handleLogin(): void {
    const email = this.loginEmail().trim();
    if (!email) return;

    this.authService.login(email);
    this.authNotice.set(null);
    this.profileMessage.set(`Đăng nhập thành công với vai trò: ${this.authService.isAdmin() ? 'ADMIN' : 'NGƯỜI XEM (CUSTOMER)'}!`);
    setTimeout(() => this.profileMessage.set(null), 3000);
  }

  loginAsAdmin(): void {
    this.authService.switchRole('admin');
    this.authNotice.set(null);
    this.profileMessage.set('Đã đăng nhập với tài khoản Quản Trị Viên (Admin) - Toàn quyền!');
    setTimeout(() => this.profileMessage.set(null), 3000);
  }

  loginAsCustomer(): void {
    this.authService.switchRole('customer');
    this.authNotice.set(null);
    this.profileMessage.set('Đã đăng nhập với tài khoản Người Xem (Customer) - Mua sắm & Giỏ hàng!');
    setTimeout(() => this.profileMessage.set(null), 3000);
  }

  handleLogout(): void {
    this.authService.logout();
    this.profileMessage.set('Đã đăng xuất khỏi hệ thống.');
    setTimeout(() => this.profileMessage.set(null), 2500);
  }

  saveProfile(): void {
    this.profileMessage.set('Cập nhật thông tin và số đo cơ thể thành công!');
    setTimeout(() => {
      this.profileMessage.set(null);
    }, 2500);
  }

  viewOrderDetail(orderCode: string): void {
    this.profileMessage.set(`Đang xem chi tiết đơn hàng: ${orderCode}`);
    setTimeout(() => {
      this.profileMessage.set(null);
    }, 2500);
  }
}
