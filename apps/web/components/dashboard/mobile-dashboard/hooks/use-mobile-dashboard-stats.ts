'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rideKeys } from '@/lib/query-keys';
import { ridesService } from '@/services/rides-service';

const STATS_QUERY_OPTIONS = {
  staleTime: 30000,
  gcTime: 300000,
  refetchOnMount: 'always' as const,
};

function useRideStatsQuery(period: 'today' | 'week' | 'month', enabled: boolean) {
  return useQuery({
    queryKey: rideKeys.stats({ period }),
    queryFn: ({ signal }) => ridesService.getStats({ period }, signal),
    enabled,
    ...STATS_QUERY_OPTIONS,
  });
}

export function useMobileDashboardStats(enabled: boolean) {
  const todayStats = useRideStatsQuery('today', enabled);
  const weekStats = useRideStatsQuery('week', enabled);
  const monthStats = useRideStatsQuery('month', enabled);

  const stats = useMemo(
    () => ({
      today: todayStats.data?.data?.totalValue || 0,
      week: weekStats.data?.data?.totalValue || 0,
      month: monthStats.data?.data?.totalValue || 0,
      monthRides: monthStats.data?.data?.rides || [],
    }),
    [todayStats.data, weekStats.data, monthStats.data],
  );

  return {
    stats,
    isLoading:
      todayStats.isLoading || weekStats.isLoading || monthStats.isLoading,
  };
}
