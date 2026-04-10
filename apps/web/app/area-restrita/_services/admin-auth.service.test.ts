import assert from 'node:assert/strict';
import test from 'node:test';
import type { AdminLoginResponse } from '../_lib/admin-auth.types';
import { resolveAdminLoginResult } from './admin-auth.service';

test('classifies admin users as authenticated admin login results', () => {
  const response: AdminLoginResponse = {
    user: {
      id: 'admin-1',
      email: 'admin@mdc.com',
      name: 'Admin',
      role: 'admin',
      hasSeenTutorial: true,
    },
  };

  assert.deepEqual(resolveAdminLoginResult(response), {
    status: 'authenticated',
    user: response.user,
  });
});

test('classifies non-admin users as access denied results', () => {
  const response: AdminLoginResponse = {
    user: {
      id: 'user-1',
      email: 'user@mdc.com',
      name: 'User',
      role: 'user',
      hasSeenTutorial: true,
    },
  };

  assert.deepEqual(resolveAdminLoginResult(response), {
    status: 'access-denied',
  });
});
