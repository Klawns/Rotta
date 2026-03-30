'use client';

import { useEffect } from 'react';
import { type QueryClient } from '@tanstack/react-query';
import { authService } from '@/services/auth-service';
import { resetAuthQueryCache } from './reset-auth-query-cache';

interface UseUnauthorizedRedirectProps {
  pathname: string;
  search: string;
  queryClient: QueryClient;
  replace: (href: string) => void;
}

export function useUnauthorizedRedirect({
  pathname,
  search,
  queryClient,
  replace,
}: UseUnauthorizedRedirectProps) {
  useEffect(() => {
    return authService.subscribe(() => {
      if (pathname.includes('/login') || pathname.includes('/area-restrita')) {
        authService.resetRedirectLock();
        return;
      }

      resetAuthQueryCache(queryClient);

      const redirectUrl = encodeURIComponent(pathname + (search ? `?${search}` : ''));
      replace(`/login?redirect=${redirectUrl}`);
    });
  }, [pathname, queryClient, replace, search]);
}
