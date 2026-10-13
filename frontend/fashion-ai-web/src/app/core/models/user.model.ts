export type UserRole = 'admin' | 'customer' | 'viewer';

export interface User {
  id: string | number;
  username: string;
  email: string;
  fullName?: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  status?: 'active' | 'suspended';
  heightCm?: number;
  weightKg?: number;
  preferredSize?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

