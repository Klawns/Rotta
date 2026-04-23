import assert from 'node:assert/strict';
import test from 'node:test';

import type { User } from '@/hooks/use-auth';
import { resolveDashboardRedirect } from './layout-access';

function createLockedUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@mdc.com',
    name: 'User',
    role: 'user',
    hasSeenTutorial: false,
    subscription: {
      plan: 'starter',
      status: 'expired',
      validUntil: null,
    },
    ...overrides,
  };
}

test('allows /dashboard/settings for locked users', () => {
  const redirect = resolveDashboardRedirect({
    pathname: '/dashboard/settings',
    isAuthenticated: true,
    user: createLockedUser(),
  });

  assert.equal(redirect, null);
});

test('allows /dashboard/settings/danger for locked users', () => {
  const redirect = resolveDashboardRedirect({
    pathname: '/dashboard/settings/danger',
    isAuthenticated: true,
    user: createLockedUser(),
  });

  assert.equal(redirect, null);
});

test('allows /dashboard/settings/backups for locked users', () => {
  const redirect = resolveDashboardRedirect({
    pathname: '/dashboard/settings/backups',
    isAuthenticated: true,
    user: createLockedUser(),
  });

  assert.equal(redirect, null);
});
