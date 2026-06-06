import assert from 'node:assert/strict';
import test from 'node:test';

import type { User } from './auth.types';
import { resolveAuthSessionState } from './session-state';

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    email: 'user@mdc.com',
    name: 'User',
    role: 'user',
    hasSeenTutorial: false,
    subscription: {
      plan: 'starter',
      status: 'active',
      validUntil: null,
    },
    ...overrides,
  };
}

function createApiError(status: number) {
  return {
    response: {
      status,
      data: {
        message: 'Service unavailable',
        statusCode: status,
      },
    },
  };
}

test('keeps a valid cached auth/me user active when a transient error is present', () => {
  const user = createUser();
  const state = resolveAuthSessionState({
    data: user,
    error: createApiError(503),
    isError: true,
    isLoading: false,
  });

  assert.equal(state.user, user);
  assert.equal(state.isAuthenticated, true);
  assert.equal(state.isAuthError, false);
  assert.equal(state.authError, null);
});

test('keeps non-401 auth/me errors operational when no user data is available', () => {
  const error = createApiError(503);
  const state = resolveAuthSessionState({
    data: null,
    error,
    isError: true,
    isLoading: false,
  });

  assert.equal(state.user, null);
  assert.equal(state.isAuthenticated, false);
  assert.equal(state.isAuthError, true);
  assert.equal(state.authError, error);
});

test('treats 401 as unauthenticated even when stale user data exists', () => {
  const state = resolveAuthSessionState({
    data: createUser(),
    error: createApiError(401),
    isError: true,
    isLoading: false,
  });

  assert.equal(state.user, null);
  assert.equal(state.isAuthenticated, false);
  assert.equal(state.isAuthError, false);
  assert.equal(state.authError, null);
});
