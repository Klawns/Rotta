"use client";

import type { Ride } from "@/types/rides";

export type Period = "today" | "week";

export interface DashboardStatsSummary {
    count: number;
    totalValue: number;
    rides: Ride[];
}
