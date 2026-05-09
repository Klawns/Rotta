'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientKeys, financeKeys, rideKeys } from '@/lib/query-keys';
import { ridesService } from '@/services/rides-service';
import type { BulkRestoreRidesResult, RideViewModel } from '@/types/rides';

type RideBulkRestoreQueryClient = Pick<
  ReturnType<typeof useQueryClient>,
  'invalidateQueries'
>;

interface UseRestoreRidesMutationOptions {
  onSuccess?: (
    result: BulkRestoreRidesResult,
    rides: RideViewModel[],
  ) => Promise<void> | void;
  onError?: (error: unknown, rides: RideViewModel[]) => Promise<void> | void;
}

export async function invalidateRideCachesAfterBulkRestore(
  queryClient: RideBulkRestoreQueryClient,
  clientIds: string[],
) {
  const uniqueClientIds = Array.from(
    new Set(clientIds.filter((clientId) => Boolean(clientId))),
  );

  const tasks: Array<Promise<unknown>> = [
    queryClient.invalidateQueries({ queryKey: rideKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: [...rideKeys.all, 'stats'] }),
    queryClient.invalidateQueries({ queryKey: rideKeys.frequentClients() }),
    queryClient.invalidateQueries({ queryKey: financeKeys.all }),
  ];

  for (const clientId of uniqueClientIds) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(clientId),
        exact: true,
      }),
    );
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: clientKeys.balance(clientId),
        exact: true,
      }),
    );
  }

  await Promise.all(tasks);
}

export function useRestoreRidesMutation(
  options?: UseRestoreRidesMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rides: RideViewModel[]) => {
      const ids = Array.from(new Set(rides.map((ride) => ride.id).filter(Boolean)));
      return ridesService.restoreRides(ids);
    },
    onSuccess: async (result, rides) => {
      await invalidateRideCachesAfterBulkRestore(
        queryClient,
        rides.map((ride) => ride.clientId ?? ''),
      );
      await options?.onSuccess?.(result, rides);
    },
    onError: async (error, rides) => {
      await options?.onError?.(error, rides);
    },
  });
}
