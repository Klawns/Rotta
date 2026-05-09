import assert from 'node:assert/strict';
import test from 'node:test';
import { clientKeys, financeKeys, rideKeys } from '@/lib/query-keys';
import { invalidateRideCachesAfterRestore } from './use-restore-ride-mutation';

test('invalidates shared and client caches after a ride restore', async () => {
  const invalidated: Array<readonly unknown[]> = [];
  const queryClient: Parameters<typeof invalidateRideCachesAfterRestore>[0] = {
    invalidateQueries: async (filters) => {
      if (filters?.queryKey) {
        invalidated.push(filters.queryKey);
      }
    },
  };

  await invalidateRideCachesAfterRestore(queryClient, {
    id: 'ride-1',
    clientId: 'client-1',
  });

  assert.deepEqual(invalidated, [
    rideKeys.lists(),
    rideKeys.detail('ride-1'),
    [...rideKeys.all, 'stats'],
    rideKeys.frequentClients(),
    financeKeys.all,
    clientKeys.detail('client-1'),
    clientKeys.balance('client-1'),
  ]);
});

test('skips client invalidation when the restored ride has no client id', async () => {
  const invalidated: Array<readonly unknown[]> = [];
  const queryClient: Parameters<typeof invalidateRideCachesAfterRestore>[0] = {
    invalidateQueries: async (filters) => {
      if (filters?.queryKey) {
        invalidated.push(filters.queryKey);
      }
    },
  };

  await invalidateRideCachesAfterRestore(queryClient, {
    id: 'ride-1',
    clientId: null,
  });

  assert.deepEqual(invalidated, [
    rideKeys.lists(),
    rideKeys.detail('ride-1'),
    [...rideKeys.all, 'stats'],
    rideKeys.frequentClients(),
    financeKeys.all,
  ]);
});
