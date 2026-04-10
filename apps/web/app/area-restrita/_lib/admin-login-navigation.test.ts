import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getAdminLoginPendingState,
  shouldRedirectWithAdminSessionGate,
} from './admin-login-navigation';

test('uses the session gate redirect only when there is no post-submit navigation in progress', () => {
  assert.equal(
    shouldRedirectWithAdminSessionGate({
      isRedirectingAfterSubmit: false,
      redirectTo: '/admin',
    }),
    true,
  );

  assert.equal(
    shouldRedirectWithAdminSessionGate({
      isRedirectingAfterSubmit: true,
      redirectTo: '/admin',
    }),
    false,
  );

  assert.equal(
    shouldRedirectWithAdminSessionGate({
      isRedirectingAfterSubmit: false,
      redirectTo: null,
    }),
    false,
  );
});

test('keeps the screen blocked while checking session or redirecting after submit', () => {
  assert.equal(
    getAdminLoginPendingState({
      isCheckingSession: true,
      isRedirectingAfterSubmit: false,
    }),
    true,
  );

  assert.equal(
    getAdminLoginPendingState({
      isCheckingSession: false,
      isRedirectingAfterSubmit: true,
    }),
    true,
  );

  assert.equal(
    getAdminLoginPendingState({
      isCheckingSession: false,
      isRedirectingAfterSubmit: false,
    }),
    false,
  );
});
