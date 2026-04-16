import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryClient } from '@tanstack/react-query';

import { authKeys } from '@/lib/query-keys';
import type { User } from './auth.types';
import { markAuthTutorialSeen } from './mark-auth-tutorial-seen';

test('marks the cached authenticated user tutorial flag as seen', () => {
  const calls: Array<{
    queryKey: readonly unknown[];
    data: User | null;
  }> = [];
  const user: User = {
    id: 'user-1',
    email: 'user@mdc.com',
    name: 'User',
    role: 'user',
    hasSeenTutorial: false,
  };
  const queryClient = new QueryClient();

  queryClient.setQueryData(authKeys.user(), user);

  markAuthTutorialSeen(queryClient);

  calls.push({
    queryKey: authKeys.user(),
    data: queryClient.getQueryData<User | null>(authKeys.user()) ?? null,
  });

  assert.deepEqual(calls, [{
    queryKey: authKeys.user(),
    data: { ...user, hasSeenTutorial: true },
  }]);
});

test('keeps a missing authenticated user cache entry as null', () => {
  const queryClient = new QueryClient();

  markAuthTutorialSeen(queryClient);

  assert.equal(queryClient.getQueryData(authKeys.user()), undefined);
});
