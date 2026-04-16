import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { authKeys } from '@/lib/query-keys';
import type { User } from './auth.types';
import { syncAuthUserCache } from './sync-auth-user-cache';

test('writes the authenticated user to the auth query cache', () => {
  const user: User = {
    id: 'user-1',
    email: 'admin@mdc.com',
    name: 'Admin',
    role: 'admin',
    hasSeenTutorial: true,
  };
  const queryClient = new QueryClient();

  syncAuthUserCache(queryClient, user);

  assert.deepEqual(queryClient.getQueryData(authKeys.user()), user);
});
