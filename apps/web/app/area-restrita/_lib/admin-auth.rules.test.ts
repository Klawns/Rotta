import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canAccessAdminRoute,
  isAdminRole,
  resolveAdminRedirect,
  resolveAdminSessionGateRedirect,
} from './admin-auth.rules';

test('keeps admin users inside the restricted area flow', () => {
  assert.equal(isAdminRole('admin'), true);
  assert.equal(resolveAdminRedirect('admin'), '/admin');
});

test('sends non-admin users back to the regular dashboard flow', () => {
  assert.equal(isAdminRole('user'), false);
  assert.equal(isAdminRole(undefined), false);
  assert.equal(resolveAdminRedirect('user'), '/dashboard');
  assert.equal(resolveAdminRedirect(undefined), '/dashboard');
});

test('only allows admin routes with an active admin reauth marker', () => {
  assert.equal(canAccessAdminRoute('admin', true), true);
  assert.equal(canAccessAdminRoute('admin', false), false);
  assert.equal(canAccessAdminRoute('user', true), false);
});

test('keeps admins on the restricted login page until they reauthenticate', () => {
  assert.equal(resolveAdminSessionGateRedirect('admin', true), '/admin');
  assert.equal(resolveAdminSessionGateRedirect('admin', false), null);
  assert.equal(resolveAdminSessionGateRedirect('user', false), '/dashboard');
});
