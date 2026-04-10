import assert from 'node:assert/strict';
import test from 'node:test';

import type { User } from '@/hooks/use-auth';
import { shouldShowTutorial } from './tutorial.rules';

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@mdc.com',
    name: 'User',
    role: 'user',
    hasSeenTutorial: false,
    subscription: {
      plan: 'premium',
      status: 'active',
      validUntil: '2026-12-31T00:00:00.000Z',
    },
    ...overrides,
  };
}

test('shows the tutorial for eligible active users who have not dismissed it', () => {
  assert.equal(
    shouldShowTutorial({
      user: createUser(),
      isLoading: false,
    }),
    true,
  );
});

test('hides the tutorial while auth is loading', () => {
  assert.equal(
    shouldShowTutorial({
      user: createUser(),
      isLoading: true,
    }),
    false,
  );
});

test('hides the tutorial when the eligible user already dismissed it in the session', () => {
  const user = createUser();

  assert.equal(
    shouldShowTutorial({
      user,
      isLoading: false,
      dismissedTutorialUserId: user.id,
    }),
    false,
  );
});

test('hides the tutorial for users without an eligible subscription status', () => {
  assert.equal(
    shouldShowTutorial({
      user: createUser({
        subscription: {
          plan: 'premium',
          status: 'inactive',
          validUntil: null,
        },
      }),
      isLoading: false,
    }),
    false,
  );
});

test('hides the tutorial for admin users even with an active subscription', () => {
  assert.equal(
    shouldShowTutorial({
      user: createUser({ role: 'admin' }),
      isLoading: false,
    }),
    false,
  );
});
