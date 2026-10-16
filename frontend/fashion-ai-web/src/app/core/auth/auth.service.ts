import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User, AuthState, UserRole } from '../models/user.model';
import { SupabaseService } from '../services/supabase.service';

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
  private readonly supabase = inject(SupabaseService);

  private readonly TOKEN_KEY = 'studio_auth_token';
  private readonly USER_KEY = 'studio_auth_user';

  // Loading indicator for async auth calls
  readonly isLoading = signal<boolean>(false);

  // State
  private readonly state = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
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
      this.initAuth();
    }
  }

  private async initAuth(): Promise<void> {
    // 1. Try restore cached session first for instantaneous UI render
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

    // 2. Synchronize with real Supabase Auth session
    try {
      const session = await this.supabase.getSession();
      if (session) {
        await this.syncSupabaseUser(session);
      }

      // Listen for background auth changes (sign-in, sign-out, token refresh)
      this.supabase.onAuthStateChange(async (event, currentSession) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (currentSession) {
            await this.syncSupabaseUser(currentSession);
          }
        } else if (event === 'SIGNED_OUT') {
          const cur = this.currentUser();
          if (cur && !cur.id.toString().startsWith('usr-')) {
            this.clearLocalSession();
          }
        }
      });
    } catch (err) {
      console.warn('Supabase Auth init error:', err);
    }
  }

  private async syncSupabaseUser(session: any): Promise<void> {
    const sbUser = session.user;
    if (!sbUser) return;

    let fullName = sbUser.user_metadata?.['full_name'] || sbUser.email?.split('@')[0] || 'Khách Hàng';
    let phone = '';
    let avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80';

    try {
      const { data: profile } = await this.supabase.from('profiles').select('*').eq('id', sbUser.id).maybeSingle();
      if (profile) {
        if (profile.full_name) fullName = profile.full_name;
        if (profile.phone) phone = profile.phone;
        if (profile.avatar_path) avatarUrl = profile.avatar_path;
      }
    } catch (err) {
      console.warn('Failed to load Supabase profile:', err);
    }

    let role: UserRole = 'customer';
    try {
      const { data: roleRow } = await this.supabase.from('user_roles').select('role').eq('user_id', sbUser.id).maybeSingle();
      if (roleRow?.role === 'admin' || sbUser.user_metadata?.['role'] === 'admin' || sbUser.email?.includes('admin')) {
        role = 'admin';
      }
    } catch {
      if (sbUser.email?.includes('admin')) {
        role = 'admin';
      }
    }

    const appUser: User = {
      id: sbUser.id,
      username: sbUser.email?.split('@')[0] || sbUser.id,
      email: sbUser.email || '',
      fullName,
      phone,
      role,
      avatarUrl,
      status: 'active',
      createdAt: sbUser.created_at ? new Date(sbUser.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN')
    };

    this.setSession(session.access_token, appUser);
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
   * Đăng nhập thật qua Supabase Auth
   */
  async loginWithSupabase(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      });

      if (error) {
        return { success: false, error: this.translateAuthError(error.message) };
      }

      if (data.session) {
        await this.syncSupabaseUser(data.session);
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Không thể kết nối đến máy chủ xác thực.' };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Đăng ký tài khoản mới qua Supabase Auth
   */
  async registerWithSupabase(
    email: string,
    password: string,
    fullName: string
  ): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> {
    this.isLoading.set(true);
    try {
      const { data, error } = await this.supabase.client.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            full_name: fullName.trim()
          }
        }
      });

      if (error) {
        return { success: false, error: this.translateAuthError(error.message) };
      }

      if (data.session) {
        await this.syncSupabaseUser(data.session);
        return { success: true, needsConfirmation: false };
      } else {
        return { success: true, needsConfirmation: true };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Không thể hoàn tất đăng ký tài khoản.' };
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Cập nhật thông tin profile lên bảng `profiles` của Supabase
   */
  async updateProfile(updates: { fullName?: string; phone?: string; avatarUrl?: string }): Promise<{ success: boolean; error?: string }> {
    const cur = this.currentUser();
    if (!cur) return { success: false, error: 'Chưa đăng nhập' };

    try {
      if (typeof cur.id === 'string' && !cur.id.startsWith('usr-')) {
        const { error } = await this.supabase.from('profiles').update({
          full_name: updates.fullName ?? cur.fullName,
          phone: updates.phone ?? cur.phone
        }).eq('id', cur.id);

        if (error) {
          console.warn('Profile update warning:', error.message);
        }
      }

      const updatedUser: User = {
        ...cur,
        fullName: updates.fullName ?? cur.fullName,
        phone: updates.phone ?? cur.phone,
        avatarUrl: updates.avatarUrl ?? cur.avatarUrl
      };
      this.setSession(this.token() || '', updatedUser);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
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

  /**
   * Fallback mock login cho demo
   */
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

  async logout(): Promise<void> {
    try {
      await this.supabase.client.auth.signOut();
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }
    this.clearLocalSession();
  }

  private clearLocalSession(): void {
    this.state.set({
      token: null,
      user: null,
      isAuthenticated: false
    });
    if (this.isBrowser) {
      this.clearStorage();
    }
  }

  private translateAuthError(msg: string): string {
    const lower = msg.toLowerCase();
    if (lower.includes('invalid login credentials') || lower.includes('invalid credentials')) {
      return 'Email hoặc mật khẩu không chính xác.';
    }
    if (lower.includes('user already registered') || lower.includes('already registered')) {
      return 'Email này đã được sử dụng. Vui lòng chọn đăng nhập hoặc dùng email khác.';
    }
    if (lower.includes('password should be at least')) {
      return 'Mật khẩu phải chứa ít nhất 6 ký tự.';
    }
    if (lower.includes('email not confirmed')) {
      return 'Tài khoản chưa được kích hoạt qua email. Vui lòng kiểm tra hộp thư của bạn.';
    }
    if (lower.includes('rate limit')) {
      return 'Thao tác quá nhiều lần liên tiếp. Vui lòng đợi ít phút và thử lại.';
    }
    return msg;
  }

  // --- Admin User Management Methods ---
  updateUserRole(userId: string | number, newRole: UserRole): void {
    this.allUsers.update(users =>
      users.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
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
