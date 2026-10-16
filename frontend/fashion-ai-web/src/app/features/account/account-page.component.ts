import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';
import { AuthService } from '../../core/auth/auth.service';
import { ProductStateService } from '../../core/services/product-state.service';

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
  loginPassword = signal('');
  regFullName = signal('');
  regEmail = signal('');
  regPassword = signal('');

  // Editable Profile
  userFullName = signal('');
  userPhone = signal('');
  userAddress = signal('Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh');
  userHeightCm = signal(175);
  userWeightKg = signal(68);
  userPreferredSize = signal('L');

  // Notice & Feedback Messages
  profileMessage = signal<string | null>(null);
  authNotice = signal<string | null>(null);
  authError = signal<string | null>(null);

  private returnUrl: string | null = null;

  constructor() {
    // Reactive sync when current user changes
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.userFullName.set(user.fullName || user.username || '');
        this.userPhone.set(user.phone || '');
        this.userAddress.set(user.address || 'Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh');
        if (user.heightCm) this.userHeightCm.set(user.heightCm);
        if (user.weightKg) this.userWeightKg.set(user.weightKg);
        if (user.preferredSize) this.userPreferredSize.set(user.preferredSize);
      }
    });
  }

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Tài Khoản & Xác Thực Supabase | Fashion AI Studio',
      description: 'Đăng nhập, đăng ký tài khoản qua Supabase Auth, quản lý đơn hàng và số đo cơ thể thử đồ ảo AI.',
      keywords: 'Tài khoản, đăng nhập, đăng ký, Supabase Auth, số đo AI, đơn hàng'
    });

    // Check query params for redirected errors or return URL
    this.route.queryParams.subscribe(params => {
      if (params['returnUrl']) {
        this.returnUrl = params['returnUrl'];
      }
      if (params['error'] === 'admin_required') {
        this.authNotice.set('Trang Quản Trị yêu cầu đăng nhập bằng tài khoản Quản Trị Viên (Role: Admin).');
      }
      if (params['tab'] === 'register') {
        this.authTab.set('register');
      }
    });
  }

  async handleLogin(): Promise<void> {
    const email = this.loginEmail().trim();
    const password = this.loginPassword().trim();

    if (!email || !password) {
      this.authError.set('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    this.authError.set(null);
    this.authNotice.set(null);

    const result = await this.authService.loginWithSupabase(email, password);

    if (result.success) {
      const roleText = this.authService.isAdmin() ? 'ADMIN' : 'KHÁCH HÀNG';
      this.profileMessage.set(`Đăng nhập thành công qua Supabase (Vai trò: ${roleText})!`);
      this.loginPassword.set('');

      if (this.returnUrl) {
        setTimeout(() => this.router.navigateByUrl(this.returnUrl!), 1000);
      } else {
        setTimeout(() => this.profileMessage.set(null), 3500);
      }
    } else {
      this.authError.set(result.error || 'Đăng nhập không thành công.');
    }
  }

  async handleRegister(): Promise<void> {
    const fullName = this.regFullName().trim();
    const email = this.regEmail().trim();
    const password = this.regPassword().trim();

    if (!fullName || !email || !password) {
      this.authError.set('Vui lòng điền đầy đủ Họ tên, Email và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      this.authError.set('Mật khẩu phải chứa ít nhất 6 ký tự.');
      return;
    }

    this.authError.set(null);
    this.authNotice.set(null);

    const result = await this.authService.registerWithSupabase(email, password, fullName);

    if (result.success) {
      if (result.needsConfirmation) {
        this.authNotice.set('Đăng ký tài khoản thành công! Supabase đã gửi email xác nhận. Bạn có thể kiểm tra email hoặc đăng nhập trực tiếp nếu chưa bật xác thực qua email.');
        this.authTab.set('login');
        this.loginEmail.set(email);
        this.loginPassword.set('');
      } else {
        this.profileMessage.set('Đăng ký và đăng nhập thành công tài khoản mới!');
        setTimeout(() => this.profileMessage.set(null), 3500);
      }
      this.regFullName.set('');
      this.regEmail.set('');
      this.regPassword.set('');
    } else {
      this.authError.set(result.error || 'Đăng ký không thành công.');
    }
  }

  loginAsAdmin(): void {
    this.authService.switchRole('admin');
    this.authError.set(null);
    this.authNotice.set(null);
    this.profileMessage.set('Đã đăng nhập tài khoản Quản Trị Viên (Demo Admin) - Toàn quyền!');
    setTimeout(() => this.profileMessage.set(null), 3000);
  }

  loginAsCustomer(): void {
    this.authService.switchRole('customer');
    this.authError.set(null);
    this.authNotice.set(null);
    this.profileMessage.set('Đã đăng nhập tài khoản Khách Hàng (Demo Customer)!');
    setTimeout(() => this.profileMessage.set(null), 3000);
  }

  async handleLogout(): Promise<void> {
    await this.authService.logout();
    this.profileMessage.set('Đã đăng xuất khỏi tài khoản.');
    setTimeout(() => this.profileMessage.set(null), 2500);
  }

  async saveProfile(): Promise<void> {
    this.authError.set(null);
    const res = await this.authService.updateProfile({
      fullName: this.userFullName(),
      phone: this.userPhone()
    });

    if (res.success) {
      this.profileMessage.set('Cập nhật thông tin tài khoản thành công lên Supabase!');
    } else {
      this.authError.set(res.error || 'Không thể cập nhật hồ sơ.');
    }
    setTimeout(() => this.profileMessage.set(null), 3000);
  }

  viewOrderDetail(orderCode: string): void {
    this.profileMessage.set(`Đang xem chi tiết đơn hàng: ${orderCode}`);
    setTimeout(() => this.profileMessage.set(null), 2500);
  }
}
