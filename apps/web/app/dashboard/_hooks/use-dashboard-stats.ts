"use client";

import { useState } from "react";
import type { User } from "@/hooks/use-auth";
import type { DashboardStatsSummary, Period } from "./dashboard-stats.types";
import {
    useDashboardMonthStatsQuery,
    useDashboardStatsQuery,
} from "./use-dashboard-stats-query";

const EMPTY_DASHBOARD_STATS = {
    count: 0,
    totalValue: 0,
    rides: [],
} satisfies DashboardStatsSummary;

export function useDashboardStats(user: User | null) {
    const [period, setPeriod] = useState<Period>("today");

    const { data: statsData, isLoading: isStatsLoading, refetch: fetchStats } =
        useDashboardStatsQuery(user, period);
    const { data: monthData, isLoading: isMonthLoading } =
        useDashboardMonthStatsQuery(user);

    return {
        period,
        setPeriod,
        stats: statsData?.data || EMPTY_DASHBOARD_STATS,
        monthRides: monthData?.data?.rides || [],
        isLoading: isStatsLoading || isMonthLoading,
        fetchStats,
    };
}
