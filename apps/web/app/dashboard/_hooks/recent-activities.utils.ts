"use client";

import { startOfDay, subDays } from "date-fns";
import type { Ride } from "@/types/rides";

interface RecentActivityFilters {
    limit: number;
    startDate: string;
}

export function buildRecentActivityFilters(period: "today" | "week"): RecentActivityFilters {
    const now = new Date();
    const startDate =
        period === "today" ? startOfDay(now) : startOfDay(subDays(now, 7));

    return {
        limit: 10,
        startDate: startDate.toISOString(),
    };
}

export function getUniqueRecentActivityRides(rides: Ride[]) {
    return Array.from(new Map(rides.map((ride) => [ride.id, ride])).values());
}
