'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { upsertClientCaches } from '@/lib/client-cache';
import { clientKeys } from '@/lib/query-keys';
import { clientsService } from '@/services/clients-service';
import { type Client } from '@/types/rides';

interface CreateClientInput {
  name: string;
  phone?: string | null;
  address?: string | null;
}

interface UseCreateClientMutationOptions {
  onSuccess?: (
    client: Client,
    variables: CreateClientInput,
  ) => Promise<void> | void;
  onError?: (
    error: unknown,
    variables: CreateClientInput,
  ) => Promise<void> | void;
}

export function useCreateClientMutation(
  options?: UseCreateClientMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateClientInput) => clientsService.createClient(data),
    onSuccess: async (client, variables) => {
      upsertClientCaches(queryClient, client);
      await queryClient.invalidateQueries({ queryKey: clientKeys.directories() });
      await options?.onSuccess?.(client, variables);
    },
    onError: async (error, variables) => {
      await options?.onError?.(error, variables);
    },
  });
}
