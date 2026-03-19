"use client";

import { User } from "@/hooks/use-auth";
import { DashboardHeader } from "./dashboard-header";
import { DashboardStatsGrid } from "./dashboard-stats-grid";
import { RecentActivities } from "./recent-activities";
import { QuickActions } from "./quick-actions";
import { FinanceCard } from "./finance-card";
import { RidesChart } from "@/components/dashboard/rides-chart";
import { Ride } from "../rides/types";

interface DashboardDesktopViewProps {
    user: User | null;
    period: 'today' | 'week';
    setPeriod: (period: 'today' | 'week') => void;
    stats: {
        count: number;
        totalValue: number;
        rides: Ride[];
    };
    monthRides: Ride[];
    isLoading: boolean;
    activitiesPage: number;
    setActivitiesPage: (page: number) => void;
    itemsPerPage: number;
    handleEditRide: (ride: Ride) => void;
    setRideToDelete: (ride: Ride) => void;
}

/**
 * Visão otimizada para Desktop da página de Dashboard.
 * Orquestra diversos widgets e gráficos.
 */
export function DashboardDesktopView({
    user,
    period,
    setPeriod,
    stats,
    monthRides,
    isLoading,
    activitiesPage,
    setActivitiesPage,
    itemsPerPage,
    handleEditRide,
    setRideToDelete
}: DashboardDesktopViewProps) {
    return (
        <div className="space-y-8">
            <DashboardHeader 
                userName={user?.name || ""} 
                period={period} 
                setPeriod={setPeriod} 
            />

            <DashboardStatsGrid 
                count={stats.count} 
                totalValue={stats.totalValue} 
                period={period} 
                isLoading={isLoading} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                <RecentActivities 
                    rides={stats.rides}
                    isLoading={isLoading}
                    activitiesPage={activitiesPage}
                    setActivitiesPage={setActivitiesPage}
                    itemsPerPage={itemsPerPage}
                    onEditRide={handleEditRide}
                    onDeleteRide={setRideToDelete}
                />

                <RidesChart rides={monthRides} className="h-full" />

                <QuickActions />

                <FinanceCard />
            </div>
        </div>
    );
}
