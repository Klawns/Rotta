import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';
import type { User } from '@/hooks/auth/auth.types';
import { adminKeys, authKeys } from '@/lib/query-keys';
import { cleanupUnauthorizedAdminLogin } from './cleanup-unauthorized-admin-login';

const ADMIN_USER: User = {
  id: 'admin-1',
  email: 'admin@mdc.com',
  name: 'Admin',
  role: 'admin',
  hasSeenTutorial: true,
};

test('cleans the local auth cache after logging out an unauthorized admin session', async () => {
  const queryClient = new QueryClient();
  let logoutCallCount = 0;

  queryClient.setQueryData(authKeys.user(), ADMIN_USER);
  queryClient.setQueryData(adminKeys.stats(), { totalUsers: 42 });

  await cleanupUnauthorizedAdminLogin(queryClient, async () => {
    logoutCallCount += 1;
  });

  assert.equal(logoutCallCount, 1);
  assert.equal(queryClient.getQueryData(authKeys.user()), null);
  assert.equal(
    queryClient.getQueryCache().find({ queryKey: adminKeys.stats() }),
    undefined,
  );
});

test('still clears the local auth cache when the unauthorized session logout fails', async () => {
  const queryClient = new QueryClient();

  queryClient.setQueryData(authKeys.user(), ADMIN_USER);
  queryClient.setQueryData(adminKeys.stats(), { totalUsers: 42 });

  await cleanupUnauthorizedAdminLogin(queryClient, async () => {
    throw new Error('logout failed');
  });

  assert.equal(queryClient.getQueryData(authKeys.user()), null);
  assert.equal(
    queryClient.getQueryCache().find({ queryKey: adminKeys.stats() }),
    undefined,
  );
});
