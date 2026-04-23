import type { User } from '@/hooks/auth/auth.types';

export function isAdminRole(
  role: User['role'] | undefined,
): role is Extract<User['role'], 'admin'> {
  return role === 'admin';
}

export function resolveAdminRedirect(role: User['role'] | undefined) {
  return isAdminRole(role) ? '/admin' : '/dashboard';
}

export function canAccessAdminRoute(
  role: User['role'] | undefined,
  hasAdminReauth: boolean,
) {
  return isAdminRole(role) && hasAdminReauth;
}

export function resolveAdminSessionGateRedirect(
  role: User['role'] | undefined,
  hasAdminReauth: boolean,
) {
  if (isAdminRole(role)) {
    return hasAdminReauth ? '/admin' : null;
  }

  return resolveAdminRedirect(role);
}
