'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { resolveLoginRedirect } from '../services/auth-redirect-service';
import { startGoogleAuth } from '../services/auth-google-service';

export function useLoginFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading } = useAuth();
  const redirectTo = resolveLoginRedirect(searchParams.get('redirect'), user?.role);

  useEffect(() => {
    if (isLoading || !isAuthenticated) {
      return;
    }

    router.replace(redirectTo);
  }, [isAuthenticated, isLoading, redirectTo, router]);

  return {
    isLoading,
    isAuthenticated,
    handleGoogleLogin: () => startGoogleAuth(),
  };
}
