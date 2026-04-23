import { QueryClient } from '@tanstack/react-query';
import { resetAuthQueryCache } from '@/hooks/auth/reset-auth-query-cache';
import { clearAdminReauthSession } from './admin-reauth-storage';

type LogoutUnauthorizedAdminSession = () => Promise<unknown>;

export async function cleanupUnauthorizedAdminLogin(
  queryClient: QueryClient,
  logoutUnauthorizedAdminSession: LogoutUnauthorizedAdminSession,
) {
  await logoutUnauthorizedAdminSession().catch(() => undefined);
  clearAdminReauthSession();
  resetAuthQueryCache(queryClient);
}
