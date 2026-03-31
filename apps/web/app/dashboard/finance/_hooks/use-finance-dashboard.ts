'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/use-auth';
import { useClientDirectory } from '@/hooks/use-client-directory';
import { financeKeys } from '@/lib/query-keys';
import {
  financeService,
  type FinanceDashboardParams,
} from '@/services/finance-service';
import { getSelectedClientName } from '../_lib/finance-metrics';
import { PERIODS, type Period, type PeriodId } from '../_types';

export interface FinanceFiltersState {
  period: PeriodId;
  clientId?: string;
  startDate?: string;
  endDate?: string;
}

function buildDashboardParams(
  filters: FinanceFiltersState,
): FinanceDashboardParams {
  return {
    period: filters.period,
    clientId: filters.clientId !== 'all' ? filters.clientId : undefined,
    start: filters.period === 'custom' ? filters.startDate : undefined,
    end: filters.period === 'custom' ? filters.endDate : undefined,
  };
}

export function useFinanceDashboard() {
  const { user } = useAuth();
  const { clients } = useClientDirectory();
  const [filters, setFiltersState] = useState<FinanceFiltersState>({
    period: 'month',
    clientId: 'all',
  });

  const setFilters = (newFilters: Partial<FinanceFiltersState>) => {
    setFiltersState((previous) => ({ ...previous, ...newFilters }));
  };

  const dashboardParams = useMemo(
    () => buildDashboardParams(filters),
    [filters],
  );
  const isEnabled =
    !!user &&
    (filters.period !== 'custom' || (!!filters.startDate && !!filters.endDate));
  const query = useQuery({
    queryKey: financeKeys.dashboard(dashboardParams),
    queryFn: ({ signal }) => financeService.getDashboard(dashboardParams, signal),
    enabled: isEnabled,
    staleTime: 0,
    gcTime: 300000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
  const currentPeriod: Period = useMemo(
    () => PERIODS.find((period) => period.id === filters.period) || PERIODS[0],
    [filters.period],
  );
  const isClientView = Boolean(filters.clientId && filters.clientId !== 'all');
  const selectedClientName = getSelectedClientName(clients, filters.clientId);

  return {
    user,
    clients,
    data: query.data || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    refetch: query.refetch,
    currentPeriod,
    filters,
    setFilters,
    isClientView,
    selectedClientName,
  };
}
