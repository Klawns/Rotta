import type { User } from '@/hooks/use-auth';

export function resolveLoginRedirect(
  redirect: string | null,
  role: User['role'] | undefined,
) {
  const fallbackPath = role === 'admin' ? '/admin' : '/dashboard';

  if (!redirect) {
    return fallbackPath;
  }

  if (!redirect.startsWith('/') || redirect.startsWith('//')) {
    return fallbackPath;
  }

  if (redirect.startsWith('/login') || redirect.startsWith('/area-restrita')) {
    return fallbackPath;
  }

  return redirect;
}
