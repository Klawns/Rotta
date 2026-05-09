'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientKeys, financeKeys, rideKeys } from '@/lib/query-keys';
import { ridesService } from '@/services/rides-service';
import { type RideViewModel } from '@/types/rides';

type RideRestoreQueryClient = Pick<
  ReturnType<typeof useQueryClient>,
  'invalidateQueries'
>;

interface UseRestoreRideMutationOptions {
  onSuccess?: (ride: RideViewModel) => Promise<void> | void;
  onError?: (error: unknown, ride: RideViewModel) => Promise<void> | void;
}

export async function invalidateRideCachesAfterRestore(
  queryClient: RideRestoreQueryClient,
  ride: Pick<RideViewModel, 'id' | 'clientId'>,
) {
  const tasks: Array<Promise<unknown>> = [
    queryClient.invalidateQueries({ queryKey: rideKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: rideKeys.detail(ride.id), exact: true }),
    queryClient.invalidateQueries({ queryKey: [...rideKeys.all, 'stats'] }),
    queryClient.invalidateQueries({ queryKey: rideKeys.frequentClients() }),
    queryClient.invalidateQueries({ queryKey: financeKeys.all }),
  ];

  if (ride.clientId) {
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: clientKeys.detail(ride.clientId),
        exact: true,
      }),
    );
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: clientKeys.balance(ride.clientId),
        exact: true,
      }),
    );
  }

  await Promise.all(tasks);
}

export function useRestoreRideMutation(
  options?: UseRestoreRideMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ride: RideViewModel) => ridesService.restoreRide(ride.id),
    onSuccess: async (_, ride) => {
      await invalidateRideCachesAfterRestore(queryClient, ride);
      await options?.onSuccess?.(ride);
    },
    onError: async (error, ride) => {
      await options?.onError?.(error, ride);
    },
  });
}
