import assert from 'node:assert/strict';
import test from 'node:test';

import { clientKeys, financeKeys, rideKeys } from '@/lib/query-keys';
import { invalidateRideCachesAfterDeletion } from './use-delete-ride-mutation';

test('invalidates stats, frequent clients, finance, and affected client caches after ride deletion', async () => {
  const invalidated: Array<readonly unknown[]> = [];
  const queryClient: Parameters<typeof invalidateRideCachesAfterDeletion>[0] = {
    invalidateQueries: async (filters) => {
      if (filters?.queryKey) {
        invalidated.push(filters.queryKey);
      }
    },
  };

  await invalidateRideCachesAfterDeletion(queryClient, 'client-1');

  assert.deepEqual(invalidated, [
    [...rideKeys.all, 'stats'],
    rideKeys.frequentClients(),
    financeKeys.all,
    clientKeys.detail('client-1'),
    clientKeys.balance('client-1'),
  ]);
});

test('skips client-scoped invalidations when the deleted ride has no client id', async () => {
  const invalidated: Array<readonly unknown[]> = [];
  const queryClient: Parameters<typeof invalidateRideCachesAfterDeletion>[0] = {
    invalidateQueries: async (filters) => {
      if (filters?.queryKey) {
        invalidated.push(filters.queryKey);
      }
    },
  };

  await invalidateRideCachesAfterDeletion(queryClient);

  assert.deepEqual(invalidated, [
    [...rideKeys.all, 'stats'],
    rideKeys.frequentClients(),
    financeKeys.all,
  ]);
});
