import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAdminShellNavigation,
  isAdminNavigationItemActive,
} from './admin-shell-navigation';

test('marks the overview entry as active only on the overview route', () => {
  assert.equal(
    isAdminNavigationItemActive('/admin/overview', {
      href: '/admin/overview',
      matchMode: 'exact',
    }),
    true,
  );

  assert.equal(
    isAdminNavigationItemActive('/admin/users', {
      href: '/admin/overview',
      matchMode: 'exact',
    }),
    false,
  );
});

test('marks the users entry as active across nested user routes', () => {
  assert.equal(
    isAdminNavigationItemActive('/admin/users', {
      href: '/admin/users',
      matchMode: 'prefix',
    }),
    true,
  );

  assert.equal(
    isAdminNavigationItemActive('/admin/overview', {
      href: '/admin/users',
      matchMode: 'prefix',
    }),
    false,
  );
});

test('keeps billing navigation active across nested billing routes', () => {
  assert.equal(
    isAdminNavigationItemActive('/admin/billing/plans', {
      href: '/admin/billing',
      matchMode: 'prefix',
      activePrefix: '/admin/billing',
    }),
    true,
  );

  assert.equal(
    isAdminNavigationItemActive('/admin/settings/system/global', {
      href: '/admin/billing',
      matchMode: 'prefix',
      activePrefix: '/admin/billing',
    }),
    false,
  );
});

test('falls back to overview as the primary item on the root admin redirect route', () => {
  const navigation = getAdminShellNavigation('/admin');

  assert.equal(navigation.primaryActiveItem?.href, '/admin/overview');
  assert.equal(navigation.subNavigation, null);
});

test('returns users as the active primary navigation for the users route', () => {
  const navigation = getAdminShellNavigation('/admin/users');

  assert.equal(navigation.primaryActiveItem?.href, '/admin/users');
  assert.equal(navigation.subNavigation, null);
});

test('returns the billing sub navigation for billing routes', () => {
  const navigation = getAdminShellNavigation('/admin/billing/plans');

  assert.equal(navigation.primaryActiveItem?.href, '/admin/billing');
  assert.equal(navigation.subNavigation?.items.length, 2);
  assert.equal(navigation.subNavigation?.items[0]?.href, '/admin/billing');
  assert.equal(navigation.subNavigation?.items[1]?.href, '/admin/billing/plans');
  assert.equal(navigation.subNavigation?.items[1]?.isActive, true);
});

test('returns the system sub navigation for system settings routes', () => {
  const navigation = getAdminShellNavigation('/admin/settings/system/security');

  assert.equal(navigation.primaryActiveItem?.href, '/admin/settings/system/global');
  assert.equal(navigation.subNavigation?.items.length, 3);
  assert.equal(navigation.subNavigation?.items[1]?.href, '/admin/settings/system/security');
  assert.equal(navigation.subNavigation?.items[1]?.isActive, true);
});
