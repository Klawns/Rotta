'use client';

import {
  mergeClientDirectoryEntries,
} from '@/lib/client-directory';
import { type ClientDirectoryEntry } from '@/types/rides';
import { useClientDirectoryQuery } from './use-client-directory-query';
import { useSelectedClientDirectoryEntry } from './use-selected-client-directory-entry';

interface UseClientDirectoryOptions {
  enabled?: boolean;
  limit?: number;
  search?: string;
  selectedClientId?: string;
}

export function useClientDirectory(options?: UseClientDirectoryOptions) {
  const isEnabled = options?.enabled ?? true;
  const selectedClientId = options?.selectedClientId;
  const directoryQuery = useClientDirectoryQuery({
    enabled: options?.enabled,
    limit: options?.limit,
    search: options?.search,
  });
  const selectedClientQuery = useSelectedClientDirectoryEntry({
    enabled: options?.enabled,
    selectedClientId: options?.selectedClientId,
    clients: directoryQuery.clients,
  });

  const clients: ClientDirectoryEntry[] = mergeClientDirectoryEntries(
    directoryQuery.clients,
    selectedClientQuery.selectedClient,
  );
  const error = directoryQuery.error ?? selectedClientQuery.error ?? null;
  const isError = isEnabled ? Boolean(error) : false;

  return {
    clients,
    meta: isEnabled ? directoryQuery.meta : null,
    isLoading:
      isEnabled ? directoryQuery.isLoading || selectedClientQuery.isLoading : false,
    isFetching:
      isEnabled
        ? directoryQuery.isFetching || selectedClientQuery.isFetching
        : false,
    isError,
    error: isEnabled ? error : null,
    refetch: async () => {
      const results = await Promise.all([
        directoryQuery.refetch(),
        selectedClientId
          ? selectedClientQuery.refetch()
          : Promise.resolve(undefined),
      ]);

      return results[0]!;
    },
    isReady:
      isEnabled
        ? directoryQuery.isReady && selectedClientQuery.isReady
        : false,
  };
}
