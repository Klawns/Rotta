"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useClientDirectory } from "@/hooks/use-client-directory";
import { financeKeys, rideKeys } from "@/lib/query-keys";
import { financeService } from "@/services/finance-service";
import { ridesService } from "@/services/rides-service";
import { PERIODS, Period, PeriodId } from "../_types";

export interface FinanceFiltersState {
  period: PeriodId;
  clientId?: string;
  startDate?: string;
  endDate?: string;
}

export function useFinanceDashboard() {
    const { user } = useAuth();
    const { clients } = useClientDirectory();

    const [filters, setFiltersState] = useState<FinanceFiltersState>({
        period: "month",
        clientId: "all",
    });

    const setFilters = (newFilters: Partial<FinanceFiltersState>) => {
        setFiltersState((previous) => ({ ...previous, ...newFilters }));
    };

    const dashboardParams = useMemo(
        () => ({
            period: filters.period,
            clientId: filters.clientId !== "all" ? filters.clientId : undefined,
            start: filters.period === "custom" ? filters.startDate : undefined,
            end: filters.period === "custom" ? filters.endDate : undefined,
        }),
        [filters.clientId, filters.endDate, filters.period, filters.startDate],
    );

    const isEnabled =
        !!user &&
        (filters.period !== "custom" ||
            (!!filters.startDate && !!filters.endDate));

    const {
        data: dashboardData = null,
        isLoading: isDashboardLoading,
        isFetching: isDashboardFetching,
        refetch: refetchDashboard,
    } = useQuery({
        queryKey: financeKeys.dashboard(filters),
        queryFn: ({ signal }) =>
            financeService.getDashboard(dashboardParams, signal),
        enabled: isEnabled,
        staleTime: 0,
        gcTime: 300000,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    const {
        data: summaryData,
        isLoading: isSummaryLoading,
        isFetching: isSummaryFetching,
        refetch: refetchSummary,
    } = useQuery({
        queryKey: rideKeys.stats(dashboardParams),
        queryFn: ({ signal }) => ridesService.getStats(dashboardParams, signal),
        enabled: isEnabled,
        staleTime: 0,
        gcTime: 300000,
        refetchOnMount: "always",
        refetchOnWindowFocus: true,
    });

    const mergedDashboardData = useMemo(() => {
        if (!dashboardData) {
            return null;
        }

        const stats = summaryData?.data;
        if (!stats) {
            return dashboardData;
        }

        const count = Number(stats.count || 0);
        const totalValue = Number(stats.totalValue || 0);

        return {
            ...dashboardData,
            summary: {
                ...dashboardData.summary,
                count,
                totalValue,
                ticketMedio: count > 0 ? totalValue / count : 0,
            },
        };
    }, [dashboardData, summaryData]);

    const refetch = async () => {
        await Promise.all([refetchDashboard(), refetchSummary()]);
    };

    const currentPeriod: Period = useMemo(
        () => PERIODS.find((period) => period.id === filters.period) || PERIODS[0],
        [filters.period],
    );

    return {
        user,
        clients,
        data: mergedDashboardData,
        isLoading: isDashboardLoading || isSummaryLoading,
        isFetching: isDashboardFetching || isSummaryFetching,
        refetch,
        currentPeriod,
        filters,
        setFilters,
    };
}
