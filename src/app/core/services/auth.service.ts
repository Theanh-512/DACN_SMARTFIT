import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User, AuthState } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly TOKEN_KEY = 'studio_auth_token';
  private readonly USER_KEY = 'studio_auth_user';

  private readonly state = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false
  });

  readonly currentUser = computed(() => this.state().user);
  readonly token = computed(() => this.state().token);
  readonly isAuthenticated = computed(() => this.state().isAuthenticated);

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

  private clearStorage(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
