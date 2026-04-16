'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { clientKeys, financeKeys, rideKeys } from '@/lib/query-keys';
import { removeRideCaches } from '@/lib/ride-cache';
import { ridesService } from '@/services/rides-service';
import { type RideViewModel } from '@/types/rides';

type RideDeletionQueryClient = Pick<
  ReturnType<typeof useQueryClient>,
  'invalidateQueries'
>;

interface UseDeleteRideMutationOptions {
  onSuccess?: (ride: RideViewModel) => Promise<void> | void;
  onError?: (error: unknown, ride: RideViewModel) => Promise<void> | void;
}

export async function invalidateRideCachesAfterDeletion(
  queryClient: RideDeletionQueryClient,
  clientId?: string,
) {
  const tasks: Array<Promise<unknown>> = [
    queryClient.invalidateQueries({ queryKey: [...rideKeys.all, 'stats'] }),
    queryClient.invalidateQueries({ queryKey: rideKeys.frequentClients() }),
    queryClient.invalidateQueries({ queryKey: financeKeys.all }),
  ];

  if (clientId) {
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

export function useDeleteRideMutation(
  options?: UseDeleteRideMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ride: RideViewModel) => ridesService.deleteRide(ride.id),
    onSuccess: async (_, ride) => {
      removeRideCaches(queryClient, ride.id);
      void invalidateRideCachesAfterDeletion(
        queryClient,
        ride.clientId ?? undefined,
      );
      await options?.onSuccess?.(ride);
    },
    onError: async (error, ride) => {
      await options?.onError?.(error, ride);
    },
  });
}
