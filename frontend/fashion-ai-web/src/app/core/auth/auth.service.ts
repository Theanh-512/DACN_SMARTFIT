import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User, AuthState, UserRole } from '../models/user.model';

export const DEMO_ADMIN_USER: User = {
  id: 'usr-admin-1',
  username: 'admin_master',
  email: 'admin@fashionai.com',
  fullName: 'Quản Trị Viên FashionAI',
  role: 'admin',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  phone: '0901 888 999',
  address: 'Tòa nhà Công Nghệ Cao, TP. Thủ Đức, TP. Hồ Chí Minh',
  status: 'active',
  createdAt: '01/01/2026'
};

export const DEMO_CUSTOMER_USER: User = {
  id: 'usr-cust-2',
  username: 'theanh_customer',
  email: 'customer@fashionai.com',
  fullName: 'Nguyễn Thế Anh (Người Xem / Khách Hàng)',
  role: 'customer',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  phone: '0988 123 456',
  address: 'Số 128 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
  status: 'active',
  heightCm: 175,
  weightKg: 68,
  preferredSize: 'L',
  createdAt: '15/02/2026'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly TOKEN_KEY = 'studio_auth_token';
  private readonly USER_KEY = 'studio_auth_user';

  // State
  private readonly state = signal<AuthState>({
    user: DEMO_CUSTOMER_USER, // Default to Customer role so user can see shopper features and restricted admin
    token: 'mock-jwt-token-customer',
    isAuthenticated: true
  });

  // Mock list of all registered users for Admin User Management
  readonly allUsers = signal<User[]>([
    DEMO_ADMIN_USER,
    DEMO_CUSTOMER_USER,
    {
      id: 'usr-cust-3',
      username: 'tran_mai',
      email: 'mai.tran@example.com',
      fullName: 'Trần Thị Mai',
      role: 'customer',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
      phone: '0912 345 678',
      address: 'Quận Cầu Giấy, Hà Nội',
      status: 'active',
      createdAt: '05/03/2026'
    },
    {
      id: 'usr-cust-4',
      username: 'le_nam',
      email: 'nam.le@example.com',
      fullName: 'Lê Hoàng Nam',
      role: 'customer',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      phone: '0977 654 321',
      address: 'Hải Châu, Đà Nẵng',
      status: 'active',
      createdAt: '10/03/2026'
    }
  ]);

  // Readonly selectors
  readonly currentUser = computed(() => this.state().user);
  readonly token = computed(() => this.state().token);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);
  readonly userRole = computed<UserRole | 'guest'>(() => this.state().user?.role ?? 'guest');
  readonly isAdmin = computed(() => this.state().user?.role === 'admin');
  readonly isCustomer = computed(() => this.state().user?.role === 'customer' || this.state().user?.role === 'viewer');

  constructor() {
    if (this.isBrowser) {
      this.initAuthFromStorage();
    }
  }

  private initAuthFromStorage(): void {
    try {
      const storedToken = localStorage.getItem(this.TOKEN_KEY);
      const storedUser = localStorage.getItem(this.USER_KEY);
      if (storedToken && storedUser) {
        this.state.set({
          token: storedToken,
          user: JSON.parse(storedUser) as User,
          isAuthenticated: true
        });
      }
    } catch {
      this.clearStorage();
    }
  }

  setSession(token: string, user: User): void {
    this.state.set({
      token,
      user,
      isAuthenticated: true
    });
    if (this.isBrowser) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
  }

  /**
   * Chuyển đổi nhanh vai trò để kiểm tra tính năng đồ án (Admin vs Customer vs Guest)
   */
  switchRole(role: 'admin' | 'customer' | 'guest'): void {
    if (role === 'admin') {
      this.setSession('mock-jwt-admin-token', DEMO_ADMIN_USER);
    } else if (role === 'customer') {
      this.setSession('mock-jwt-customer-token', DEMO_CUSTOMER_USER);
    } else {
      this.logout();
    }
  }

  login(email: string, _password?: string): boolean {
    if (email.toLowerCase().includes('admin')) {
      this.setSession('mock-jwt-admin-token', DEMO_ADMIN_USER);
      return true;
    }
    const matchedUser = this.allUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      this.setSession('mock-jwt-user-token', matchedUser);
    } else {
      this.setSession('mock-jwt-customer-token', {
        ...DEMO_CUSTOMER_USER,
        email
      });
    }
    return true;
  }

  logout(): void {
    this.state.set({
      token: null,
      user: null,
      isAuthenticated: false
    });
    if (this.isBrowser) {
      this.clearStorage();
    }
  }

  // --- Admin User Management Methods ---
  updateUserRole(userId: string | number, newRole: UserRole): void {
    this.allUsers.update(users =>
      users.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
    // If updating current logged in user, refresh current user state too
    const current = this.currentUser();
    if (current && current.id === userId) {
      this.setSession(this.token() || '', { ...current, role: newRole });
    }
  }

  toggleUserStatus(userId: string | number): void {
    this.allUsers.update(users =>
      users.map(u => {
        if (u.id === userId) {
          const nextStatus = u.status === 'suspended' ? 'active' : 'suspended';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  }

  addNewUser(newUser: Partial<User>): void {
    const user: User = {
      id: `usr-${Date.now()}`,
      username: newUser.username || `user_${Date.now()}`,
      email: newUser.email || 'user@example.com',
      fullName: newUser.fullName || 'Người Dùng Mới',
      role: newUser.role || 'customer',
      avatarUrl: newUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      phone: newUser.phone || '0900 000 000',
      address: newUser.address || 'TP. Hồ Chí Minh',
      status: 'active',
      createdAt: new Date().toLocaleDateString('vi-VN')
    };
    this.allUsers.update(users => [user, ...users]);
  }

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
