'use client';

import { useCurrentUserQuery } from '@/hooks/auth/use-current-user-query';
import { resolveAdminSessionGateRedirect } from '../_lib/admin-auth.rules';
import { useAdminReauthSession } from './use-admin-reauth-session';

interface AdminSessionGateState {
  redirectTo: string | null;
  isCheckingSession: boolean;
}

export function useAdminSessionGate(): AdminSessionGateState {
  const hasAdminReauth = useAdminReauthSession();
  const isAdminReauthReady = hasAdminReauth !== null;
  const sessionQuery = useCurrentUserQuery({
    enabled: true,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  const redirectTo = sessionQuery.data && isAdminReauthReady
    ? resolveAdminSessionGateRedirect(sessionQuery.data.role, hasAdminReauth)
    : null;

  return {
    redirectTo,
    isCheckingSession:
      sessionQuery.isLoading || !isAdminReauthReady || redirectTo !== null,
  };
}
