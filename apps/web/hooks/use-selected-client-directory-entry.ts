'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { toClientDirectoryEntry } from '@/lib/client-directory';
import { clientKeys } from '@/lib/query-keys';
import { clientsService } from '@/services/clients-service';
import { type ClientDirectoryEntry } from '@/types/rides';

interface UseSelectedClientDirectoryEntryOptions {
  enabled?: boolean;
  selectedClientId?: string;
  clients?: ClientDirectoryEntry[];
}

export function useSelectedClientDirectoryEntry(
  options?: UseSelectedClientDirectoryEntryOptions,
) {
  const { user } = useAuth();
  const isEnabled = !!user && (options?.enabled ?? true);
  const selectedClientId = options?.selectedClientId;
  const clients = options?.clients ?? [];
  const hasSelectedClientInDirectory = !!selectedClientId
    ? clients.some((client) => client.id === selectedClientId)
    : false;

  const query = useQuery({
    queryKey: selectedClientId
      ? clientKeys.detail(selectedClientId)
      : [...clientKeys.details(), 'selected', 'empty'],
    queryFn: ({ signal }) => clientsService.getClient(selectedClientId!, signal),
    enabled: isEnabled && !!selectedClientId && !hasSelectedClientInDirectory,
    staleTime: 1000 * 60 * 5,
  });

  return {
    selectedClient: query.data ? toClientDirectoryEntry(query.data) : null,
    isLoading: isEnabled ? query.isPending : false,
    isFetching: isEnabled ? query.isFetching : false,
    isError: isEnabled ? query.isError : false,
    error: isEnabled ? query.error ?? null : null,
    refetch: query.refetch,
    isReady:
      !isEnabled ||
      !selectedClientId ||
      hasSelectedClientInDirectory ||
      Boolean(query.data),
  };
}
