'use client';

import { useQuery } from '@tanstack/react-query';

import { adminKeys } from '@/lib/query-keys';
import { adminService } from '@/services/admin-service';

export function useAdminOverview() {
  const statsQuery = useQuery({
    queryKey: adminKeys.stats(),
    queryFn: ({ signal }) => adminService.getStats(signal),
  });

  return {
    stats: statsQuery.data ?? null,
    statsError: statsQuery.error ?? null,
    isStatsPending: statsQuery.isPending,
    refetchStats: statsQuery.refetch,
  };
}
