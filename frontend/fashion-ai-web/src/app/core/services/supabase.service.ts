import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { createClient, SupabaseClient, User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          persistSession: this.isBrowser,
          autoRefreshToken: this.isBrowser,
          detectSessionInUrl: this.isBrowser
        }
      }
    );
  }

  /**
   * Truy cập trực tiếp Supabase Client gốc
   */
  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Truy vấn bảng dữ liệu (tương tự như client.from('todos'))
   */
  from(table: string) {
    return this.supabase.from(table);
  }

  /**
   * Truy cập Supabase Storage Bucket
   */
  storage(bucketName: string) {
    return this.supabase.storage.from(bucketName);
  }

  // ==========================================
  // AUTH HELPERS
  // ==========================================

  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    return await this.supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
  }

  async signIn(email: string, password: string) {
    return await this.supabase.auth.signInWithPassword({
      email,
      password
    });
  }

  async signOut() {
    return await this.supabase.auth.signOut();
  }

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  async getCurrentUser(): Promise<User | null> {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }
}
