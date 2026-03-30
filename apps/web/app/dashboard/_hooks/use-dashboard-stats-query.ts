"use client";

import { useQuery } from "@tanstack/react-query";
import type { User } from "@/hooks/use-auth";
import { rideKeys } from "@/lib/query-keys";
import { ridesService } from "@/services/rides-service";
import type { Period } from "./dashboard-stats.types";

const DASHBOARD_STATS_STALE_TIME = 1000 * 30;

export function useDashboardStatsQuery(user: User | null, period: Period) {
    return useQuery({
        queryKey: rideKeys.stats({ period }),
        queryFn: ({ signal }) => ridesService.getStats({ period }, signal),
        enabled: !!user,
        staleTime: DASHBOARD_STATS_STALE_TIME,
        refetchOnMount: "always",
    });
}

export function useDashboardMonthStatsQuery(user: User | null) {
    return useQuery({
        queryKey: rideKeys.stats({ period: "month" }),
        queryFn: ({ signal }) => ridesService.getStats({ period: "month" }, signal),
        enabled: !!user,
        staleTime: DASHBOARD_STATS_STALE_TIME,
        refetchOnMount: "always",
    });
}
