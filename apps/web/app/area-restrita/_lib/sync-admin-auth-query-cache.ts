import type { QueryClient } from '@tanstack/react-query';

import { syncAuthUserCache } from '@/hooks/auth/sync-auth-user-cache';
import { adminKeys } from '@/lib/query-keys';
import type { User } from '@/hooks/auth/auth.types';

type AdminAuthQueryCacheClient = Pick<
  QueryClient,
  'invalidateQueries' | 'setQueryData'
>;

export async function syncAdminAuthQueryCache(
  queryClient: AdminAuthQueryCacheClient,
  user: User,
) {
  syncAuthUserCache(queryClient, user);

  await queryClient.invalidateQueries({ queryKey: adminKeys.all });
}
