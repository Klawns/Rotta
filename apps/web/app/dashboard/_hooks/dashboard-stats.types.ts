"use client";

import type { RideViewModel } from "@/types/rides";

export type Period = "today" | "week";

export interface DashboardStatsSummary {
    count: number;
    totalValue: number;
    rides: RideViewModel[];
}
