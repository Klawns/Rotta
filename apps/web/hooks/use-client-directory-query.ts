'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { clientKeys } from '@/lib/query-keys';
import { clientsService } from '@/services/clients-service';

interface UseClientDirectoryQueryOptions {
  enabled?: boolean;
  limit?: number;
  search?: string;
}

export function useClientDirectoryQuery(
  options?: UseClientDirectoryQueryOptions,
) {
  const { user } = useAuth();
  const isEnabled = !!user && (options?.enabled ?? true);
  const limit = options?.limit ?? 20;
  const search = options?.search?.trim() || undefined;

  const query = useQuery({
    queryKey: clientKeys.directory(search ? { search, limit } : { limit }),
    queryFn: ({ signal }) =>
      clientsService.getClientDirectory(search ? { search, limit } : { limit }, signal),
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });

  return {
    clients: isEnabled ? query.data?.data ?? [] : [],
    meta: isEnabled ? query.data?.meta ?? null : null,
    isLoading: isEnabled ? query.isPending : false,
    isFetching: isEnabled ? query.isFetching : false,
    isError: isEnabled ? query.isError : false,
    error: isEnabled ? query.error ?? null : null,
    refetch: query.refetch,
    isReady: isEnabled ? Boolean(query.data) : false,
  };
}
