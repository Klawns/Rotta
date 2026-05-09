"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { upsertRideCaches } from "@/lib/ride-cache";
import { authKeys, clientKeys, financeKeys, rideKeys } from "@/lib/query-keys";
import {
  submitRideDraft,
  type RideSubmissionDraft,
} from "@/components/ride-modal/lib/ride-submission";
import { type RideViewModel } from "@/types/rides";

type RideUpsertQueryClient = Pick<
  ReturnType<typeof useQueryClient>,
  "invalidateQueries"
>;

export interface SubmitRideMutationVariables {
  draft: RideSubmissionDraft;
  rideToEdit?: RideViewModel | null;
}

interface UseSubmitRideMutationOptions {
  onSuccess?: (
    ride: RideViewModel,
    variables: SubmitRideMutationVariables,
  ) => Promise<void> | void;
  onError?: (
    error: unknown,
    variables: SubmitRideMutationVariables,
  ) => Promise<void> | void;
}

export function getAffectedRideUpsertClientIds({
  rideClientId,
  selectedClientId,
  previousClientId,
}: {
  rideClientId?: string | null;
  selectedClientId?: string | null;
  previousClientId?: string | null;
}) {
  return Array.from(
    new Set(
      [rideClientId, selectedClientId, previousClientId].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  );
}

export async function invalidateRideCachesAfterUpsert(
  queryClient: RideUpsertQueryClient,
  affectedClientIds: string[],
) {
  const tasks: Array<Promise<unknown>> = [
    queryClient.invalidateQueries({ queryKey: rideKeys.lists() }),
    queryClient.invalidateQueries({ queryKey: [...rideKeys.all, "stats"] }),
    queryClient.invalidateQueries({ queryKey: rideKeys.frequentClients() }),
    queryClient.invalidateQueries({ queryKey: financeKeys.all }),
    queryClient.invalidateQueries({
      queryKey: authKeys.user(),
      exact: true,
    }),
  ];

  for (const clientId of affectedClientIds) {
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
    tasks.push(
      queryClient.invalidateQueries({
        queryKey: clientKeys.payments(clientId),
      }),
    );
  }

  await Promise.allSettled(tasks);
}

export function useSubmitRideMutation(options?: UseSubmitRideMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ draft, rideToEdit }: SubmitRideMutationVariables) =>
      submitRideDraft(draft, rideToEdit),
    onSuccess: async (ride, variables) => {
      upsertRideCaches(queryClient, ride);

      const affectedClientIds = getAffectedRideUpsertClientIds({
        rideClientId: ride.clientId,
        selectedClientId: variables.draft.selectedClientId,
        previousClientId: variables.rideToEdit?.clientId,
      });
      void invalidateRideCachesAfterUpsert(queryClient, affectedClientIds);

      await options?.onSuccess?.(ride, variables);
    },
    onError: async (error, variables) => {
      await options?.onError?.(error, variables);
    },
  });
}
