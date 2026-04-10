import assert from 'node:assert/strict';
import test from 'node:test';

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

  markAuthTutorialSeen({
    setQueryData(queryKey, updater) {
      const nextUser =
        typeof updater === 'function'
          ? updater(user)
          : (updater as User | null);

      calls.push({ queryKey, data: nextUser });
      return nextUser;
    },
  });

  assert.deepEqual(calls, [
    {
      queryKey: authKeys.user(),
      data: { ...user, hasSeenTutorial: true },
    },
  ]);
});

test('keeps a missing authenticated user cache entry as null', () => {
  let nextValue: User | null | undefined;

  markAuthTutorialSeen({
    setQueryData(_queryKey, updater) {
      nextValue =
        typeof updater === 'function'
          ? updater(null)
          : (updater as User | null);

      return nextValue;
    },
  });

  assert.equal(nextValue, null);
});
