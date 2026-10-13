import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

interface MockOrder {
  id: string;
  orderCode: string;
  date: string;
  itemsCount: number;
  total: number;
  status: 'Đang chuẩn bị' | 'Đang giao hàng' | 'Đã giao' | 'Đã hủy';
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

  isLoggedIn = signal<boolean>(true);
  authTab = signal<'login' | 'register'>('login');
  accountActiveTab = signal<'profile' | 'orders' | 'ai-history'>('profile');

  // Login / Register Form
  loginEmail = signal('theanh.nguyen@example.com');
  loginPassword = signal('••••••••');
  regFullName = signal('');
  regEmail = signal('');
  regPassword = signal('');

  // User Profile
  userProfile = signal({
    fullName: 'Nguyễn Thế Anh',
    email: 'theanh.nguyen@example.com',
    phone: '0988 123 456',
    address: 'Khu Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh',
    heightCm: 175,
    weightKg: 68,
    preferredSize: 'L'
  });

  // Mock Orders History
  orders = signal<MockOrder[]>([
    {
      id: 'ord-1',
      orderCode: 'FA-2026-981240',
      date: '12/10/2026',
      itemsCount: 2,
      total: 1248000,
      status: 'Đang giao hàng'
    },
    {
      id: 'ord-2',
      orderCode: 'FA-2026-773192',
      date: '02/10/2026',
      itemsCount: 1,
      total: 899000,
      status: 'Đã giao'
    }
  ]);

  profileMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.seo.updateSeo({
      title: 'Tài Khoản & Lịch Sử Đơn Hàng | Fashion AI Studio',
      description: 'Quản lý thông tin cá nhân, số đo vóc dáng AI và theo dõi tình trạng đơn hàng thời trang của bạn.',
      keywords: 'Tài khoản người dùng, đơn hàng, số đo AI'
    });
  }

  handleLogin(): void {
    this.isLoggedIn.set(true);
  }

  handleLogout(): void {
    this.isLoggedIn.set(false);
  }

  saveProfile(): void {
    this.profileMessage.set('Cập nhật thông tin và số đo cơ thể thành công!');
    setTimeout(() => {
      this.profileMessage.set(null);
    }, 2500);
  }

  viewOrderDetail(orderCode: string): void {
    this.profileMessage.set(`Đang xem thông tin chi tiết của đơn hàng ${orderCode}`);
    setTimeout(() => {
      this.profileMessage.set(null);
    }, 2500);
  }
}
