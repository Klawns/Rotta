import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import type { User } from '@/hooks/auth/auth.types';
import { adminKeys, authKeys } from '@/lib/query-keys';
import { syncAdminAuthQueryCache } from './sync-admin-auth-query-cache';

test('syncs the authenticated admin user and invalidates admin queries', async () => {
  const invalidatedQueryKeys: Array<readonly unknown[]> = [];
  const user: User = {
    id: 'admin-1',
    email: 'admin@mdc.com',
    name: 'Admin',
    role: 'admin',
    hasSeenTutorial: true,
  };
  const queryClient = new QueryClient();
  const invalidateQueries = queryClient.invalidateQueries.bind(queryClient);

  queryClient.invalidateQueries = ((filters, options) => {
    if (filters?.queryKey) {
      invalidatedQueryKeys.push(filters.queryKey as readonly unknown[]);
    }

    return invalidateQueries(filters, options);
  }) as typeof queryClient.invalidateQueries;

  await syncAdminAuthQueryCache(queryClient, user);

  assert.deepEqual(queryClient.getQueryData(authKeys.user()), user);
  assert.deepEqual(invalidatedQueryKeys, [adminKeys.all]);
});
