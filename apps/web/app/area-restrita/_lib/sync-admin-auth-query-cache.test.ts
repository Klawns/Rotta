import assert from 'node:assert/strict';
import test from 'node:test';

import type { User } from '@/hooks/auth/auth.types';
import { adminKeys, authKeys } from '@/lib/query-keys';
import { syncAdminAuthQueryCache } from './sync-admin-auth-query-cache';

test('syncs the authenticated admin user and invalidates admin queries', async () => {
  const calls: Array<
    | { type: 'set'; queryKey: readonly unknown[]; data: User }
    | { type: 'invalidate'; queryKey: readonly unknown[] }
  > = [];
  const user: User = {
    id: 'admin-1',
    email: 'admin@mdc.com',
    name: 'Admin',
    role: 'admin',
    hasSeenTutorial: true,
  };

  await syncAdminAuthQueryCache(
    {
      setQueryData(queryKey, data) {
        calls.push({ type: 'set', queryKey, data: data as User });
        return data;
      },
      invalidateQueries({ queryKey }) {
        calls.push({ type: 'invalidate', queryKey });
        return Promise.resolve();
      },
    },
    user,
  );

  assert.deepEqual(calls, [
    { type: 'set', queryKey: authKeys.user(), data: user },
    { type: 'invalidate', queryKey: adminKeys.all },
  ]);
});
