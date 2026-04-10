import { apiClient } from '@/services/api';
import { isAdminRole } from '../_lib/admin-auth.rules';
import type {
  AdminLoginCredentials,
  AdminLoginResult,
  AdminLoginResponse,
} from '../_lib/admin-auth.types';

export const ADMIN_ACCESS_DENIED_MESSAGE =
  'Este acesso e exclusivo para administradores.';

export class AdminAccessDeniedError extends Error {
  constructor(message = ADMIN_ACCESS_DENIED_MESSAGE) {
    super(message);
    this.name = 'AdminAccessDeniedError';
  }
}

function normalizeAdminLoginCredentials(
  credentials: AdminLoginCredentials,
): AdminLoginCredentials {
  return {
    email: credentials.email.trim().toLowerCase(),
    password: credentials.password,
  };
}

async function logoutUnauthorizedAdminSession() {
  await apiClient.post('/auth/logout', undefined, {
    _skipRedirect: true,
    _skipRefresh: true,
  });
}

export function resolveAdminLoginResult(
  response: AdminLoginResponse,
): AdminLoginResult {
  if (!isAdminRole(response.user.role)) {
    return { status: 'access-denied' };
  }

  return {
    status: 'authenticated',
    user: response.user,
  };
}

async function login(
  credentials: AdminLoginCredentials,
): Promise<AdminLoginResult> {
  const response = await apiClient.post<AdminLoginResponse>(
    '/auth/login',
    normalizeAdminLoginCredentials(credentials),
    {
      _skipRedirect: true,
      _skipRefresh: true,
    },
  );

  return resolveAdminLoginResult(response);
}

export const adminAuthService = {
  login,
  logoutUnauthorizedAdminSession,
};

export function isAdminAccessDeniedError(
  error: unknown,
): error is AdminAccessDeniedError {
  return error instanceof AdminAccessDeniedError;
}
