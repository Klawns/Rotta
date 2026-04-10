import type { User } from '@/hooks/auth/auth.types';

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  user: User;
}

export interface AuthenticatedAdminLoginResult {
  status: 'authenticated';
  user: User;
}

export interface AccessDeniedAdminLoginResult {
  status: 'access-denied';
}

export type AdminLoginResult =
  | AuthenticatedAdminLoginResult
  | AccessDeniedAdminLoginResult;
