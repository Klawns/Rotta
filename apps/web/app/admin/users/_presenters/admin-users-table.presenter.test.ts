import assert from 'node:assert/strict';
import test from 'node:test';

import type { AdminRecentUser } from '@/types/admin';
import {
  presentAdminUsersPagination,
  presentAdminUsersTableRows,
} from './admin-users-table.presenter';

function createUser(overrides: Partial<AdminRecentUser> = {}): AdminRecentUser {
  return {
    id: 'user-1',
    name: 'Usuario Teste',
    email: 'usuario@teste.com',
    role: 'user',
    createdAt: '2026-04-20T00:00:00.000Z',
    plan: 'starter',
    validUntil: null,
    daysLeft: null,
    ...overrides,
  };
}

test('keeps admins as non-editable rows with a role badge', () => {
  const [row] = presentAdminUsersTableRows([
    createUser({
      id: 'admin-1',
      role: 'admin',
      plan: 'lifetime',
      daysLeft: 10,
    }),
  ]);

  assert.equal(row.id, 'admin-1');
  assert.equal(row.canManagePlan, false);
  assert.equal(row.roleBadgeLabel, 'Admin');
  assert.equal(row.planValue, 'lifetime');
  assert.equal(row.planTone, 'accent');
  assert.equal(row.planDetails, null);
});

test('presents premium users with editable plan and remaining-days copy', () => {
  const [row] = presentAdminUsersTableRows([
    createUser({
      plan: 'premium',
      daysLeft: 1,
    }),
  ]);

  assert.equal(row.canManagePlan, true);
  assert.equal(row.roleBadgeLabel, null);
  assert.equal(row.planValue, 'premium');
  assert.equal(row.planTone, 'success');
  assert.equal(row.planDetails, '1 dia restante');
});

test('falls back null plans to starter in the users table view model', () => {
  const [row] = presentAdminUsersTableRows([
    createUser({
      plan: null,
      daysLeft: null,
    }),
  ]);

  assert.equal(row.planValue, 'starter');
  assert.equal(row.planTone, 'neutral');
  assert.equal(row.planDetails, null);
});

test('builds pagination state with summary and button availability', () => {
  const pagination = presentAdminUsersPagination({
    usersCount: 10,
    totalUsers: 26,
    currentPage: 2,
    totalPages: 3,
    isLoading: false,
  });

  assert.equal(pagination.summary, 'Mostrando 10 de 26 usuarios');
  assert.equal(pagination.currentPageLabel, '2 / 3');
  assert.equal(pagination.isPreviousDisabled, false);
  assert.equal(pagination.isNextDisabled, false);
});

test('disables both pagination actions while loading and clamps invalid totals', () => {
  const pagination = presentAdminUsersPagination({
    usersCount: 0,
    totalUsers: 0,
    currentPage: 1,
    totalPages: 0,
    isLoading: true,
  });

  assert.equal(pagination.summary, 'Mostrando 0 de 0 usuarios');
  assert.equal(pagination.currentPageLabel, '1 / 1');
  assert.equal(pagination.isPreviousDisabled, true);
  assert.equal(pagination.isNextDisabled, true);
});
