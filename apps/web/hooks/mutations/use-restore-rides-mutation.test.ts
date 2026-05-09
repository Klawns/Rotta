import assert from 'node:assert/strict';
import test from 'node:test';
import { clientKeys, financeKeys, rideKeys } from '@/lib/query-keys';
import { invalidateRideCachesAfterBulkRestore } from './use-restore-rides-mutation';

test('invalidates shared caches and each affected client once after bulk restore', async () => {
  const invalidated: Array<readonly unknown[]> = [];
  const queryClient: Parameters<typeof invalidateRideCachesAfterBulkRestore>[0] = {
    invalidateQueries: async (filters) => {
      if (filters?.queryKey) {
        invalidated.push(filters.queryKey);
      }
    },
  };

  await invalidateRideCachesAfterBulkRestore(queryClient, [
    'client-1',
    'client-2',
    'client-1',
  ]);

  assert.deepEqual(invalidated, [
    rideKeys.lists(),
    [...rideKeys.all, 'stats'],
    rideKeys.frequentClients(),
    financeKeys.all,
    clientKeys.detail('client-1'),
    clientKeys.balance('client-1'),
    clientKeys.detail('client-2'),
    clientKeys.balance('client-2'),
  ]);
});

test('skips client invalidation when restored rides have no client ids', async () => {
  const invalidated: Array<readonly unknown[]> = [];
  const queryClient: Parameters<typeof invalidateRideCachesAfterBulkRestore>[0] = {
    invalidateQueries: async (filters) => {
      if (filters?.queryKey) {
        invalidated.push(filters.queryKey);
      }
    },
  };

  await invalidateRideCachesAfterBulkRestore(queryClient, ['', '']);

  assert.deepEqual(invalidated, [
    rideKeys.lists(),
    [...rideKeys.all, 'stats'],
    rideKeys.frequentClients(),
    financeKeys.all,
  ]);
});
