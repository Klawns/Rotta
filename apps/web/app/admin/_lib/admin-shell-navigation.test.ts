import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAdminShellNavigation,
  isAdminNavigationItemActive,
} from './admin-shell-navigation';

test('marks the dashboard entry as active only on the root admin route', () => {
  assert.equal(
    isAdminNavigationItemActive('/admin', {
      href: '/admin',
      matchMode: 'exact',
    }),
    true,
  );

  assert.equal(
    isAdminNavigationItemActive('/admin/settings/finance/plans', {
      href: '/admin',
      matchMode: 'exact',
    }),
    false,
  );
});

test('keeps finance navigation active across nested settings routes', () => {
  assert.equal(
    isAdminNavigationItemActive('/admin/settings/finance/plans', {
      href: '/admin/settings/finance/plans',
      matchMode: 'prefix',
    }),
    true,
  );

  assert.equal(
    isAdminNavigationItemActive('/admin/settings/system/global', {
      href: '/admin/settings/finance/plans',
      matchMode: 'prefix',
    }),
    false,
  );
});

test('returns the finance sub navigation for finance settings routes', () => {
  const navigation = getAdminShellNavigation('/admin/settings/finance/coupons');

  assert.equal(navigation.primaryActiveItem?.href, '/admin/settings/finance/plans');
  assert.equal(navigation.subNavigation?.items.length, 2);
  assert.equal(navigation.subNavigation?.items[1]?.href, '/admin/settings/finance/coupons');
  assert.equal(navigation.subNavigation?.items[1]?.isActive, true);
});

test('returns the system sub navigation for system settings routes', () => {
  const navigation = getAdminShellNavigation('/admin/settings/system/security');

  assert.equal(navigation.primaryActiveItem?.href, '/admin/settings/system/global');
  assert.equal(navigation.subNavigation?.items.length, 3);
  assert.equal(navigation.subNavigation?.items[1]?.href, '/admin/settings/system/security');
  assert.equal(navigation.subNavigation?.items[1]?.isActive, true);
});
