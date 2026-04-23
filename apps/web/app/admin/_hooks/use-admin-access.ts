'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { canAccessAdminRoute } from '@/app/area-restrita/_lib/admin-auth.rules';
import { useAdminReauthSession } from '@/app/area-restrita/_hooks/use-admin-reauth-session';

export function useAdminAccess() {
  const { user, isAuthenticated, isLoading, isAuthError, authError } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasAdminReauth = useAdminReauthSession();
  const isAdminReauthReady = hasAdminReauth !== null;

  const restrictedLoginRedirect = useMemo(() => {
    const search = searchParams.toString();
    const redirectTarget = encodeURIComponent(
      pathname + (search ? `?${search}` : ''),
    );

    return `/area-restrita?redirect=${redirectTarget}`;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (isLoading || isAuthError || !isAdminReauthReady) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(restrictedLoginRedirect);
      return;
    }

    if (user?.role !== 'admin') {
      router.replace('/dashboard');
      return;
    }

    if (!hasAdminReauth) {
      router.replace(restrictedLoginRedirect);
    }
  }, [
    hasAdminReauth,
    isAdminReauthReady,
    isAuthenticated,
    isAuthError,
    isLoading,
    restrictedLoginRedirect,
    router,
    user,
  ]);

  return {
    user,
    isLoading: isLoading || !isAdminReauthReady,
    isAdmin: canAccessAdminRoute(user?.role, hasAdminReauth ?? false),
    isAuthError,
    authError,
  };
}
