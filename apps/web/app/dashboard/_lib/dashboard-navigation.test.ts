import assert from 'node:assert/strict';
import test from 'node:test';

import type { User } from '@/hooks/use-auth';
import {
  getDashboardNavigationItems,
  isDashboardNavItemActive,
} from './dashboard-navigation';

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

test('activates only Configurações on /dashboard/settings', () => {
  const items = getDashboardNavigationItems(createUser());
  const settingsItem = items.find((item) => item.href === '/dashboard/settings');
  const backupsItem = items.find(
    (item) => item.href === '/dashboard/settings/backups',
  );

  assert.ok(settingsItem);
  assert.ok(backupsItem);
  assert.equal(isDashboardNavItemActive(settingsItem, '/dashboard/settings'), true);
  assert.equal(
    isDashboardNavItemActive(backupsItem, '/dashboard/settings'),
    false,
  );
});

test('activates only Configurações on /dashboard/settings/danger', () => {
  const items = getDashboardNavigationItems(createUser());
  const settingsItem = items.find((item) => item.href === '/dashboard/settings');
  const backupsItem = items.find(
    (item) => item.href === '/dashboard/settings/backups',
  );

  assert.ok(settingsItem);
  assert.ok(backupsItem);
  assert.equal(
    isDashboardNavItemActive(settingsItem, '/dashboard/settings/danger'),
    true,
  );
  assert.equal(
    isDashboardNavItemActive(backupsItem, '/dashboard/settings/danger'),
    false,
  );
});

test('activates only Backups on /dashboard/settings/backups', () => {
  const items = getDashboardNavigationItems(createUser());
  const settingsItem = items.find((item) => item.href === '/dashboard/settings');
  const backupsItem = items.find(
    (item) => item.href === '/dashboard/settings/backups',
  );

  assert.ok(settingsItem);
  assert.ok(backupsItem);
  assert.equal(
    isDashboardNavItemActive(settingsItem, '/dashboard/settings/backups'),
    false,
  );
  assert.equal(
    isDashboardNavItemActive(backupsItem, '/dashboard/settings/backups'),
    true,
  );
});

test('keeps the backups entry enabled for locked users', () => {
  const items = getDashboardNavigationItems(
    createUser({
      subscription: {
        plan: 'starter',
        status: 'expired',
        validUntil: null,
      },
    }),
  );
  const backupsItem = items.find(
    (item) => item.href === '/dashboard/settings/backups',
  );

  assert.ok(backupsItem);
  assert.equal(backupsItem.disabled, false);
});
