'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { clientKeys } from '@/lib/query-keys';
import { clientsService } from '@/services/clients-service';

export function useClientDirectory() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: clientKeys.lists(),
    queryFn: ({ signal }) => clientsService.getClients(undefined, signal),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  return {
    ...query,
    clients: query.data?.data || [],
  };
}
