"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { rideKeys } from "@/lib/query-keys";
import { type Ride } from "@/types/rides";
import { type Period } from "./dashboard-stats.types";
import { useDashboardRides } from "./use-dashboard-rides";
import { useDashboardStats } from "./use-dashboard-stats";
import { useDashboardUI } from "./use-dashboard-ui";
import { usePaymentToast } from "./use-payment-toast";
import { useFreeTrial } from "@/hooks/use-free-trial";

export interface DashboardDesktopStats {
    period: Period;
    setPeriod: (period: Period) => void;
    count: number;
    totalValue: number;
    monthRides: Ride[];
    isLoading: boolean;
}

export interface DashboardMobileStats {
    period: Period;
    count: number;
    totalValue: number;
}

export interface DashboardRideActions {
    editRide: (ride: Ride) => void;
    requestRideDelete: (ride: Ride) => void;
}

export function useDashboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const trial = useFreeTrial(user);

    usePaymentToast();

    const { isMobile } = useDashboardUI();
    const { period, setPeriod, stats, monthRides, isLoading } =
        useDashboardStats(user);
    const refreshDashboard = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: rideKeys.all });
        await queryClient.refetchQueries({
            queryKey: rideKeys.all,
            type: "active",
        });
    }, [queryClient]);
    const rides = useDashboardRides({
        onRideDeleted: refreshDashboard,
    });

    return {
        user,
        trial,
        isMobile,
        refreshDashboard,
        desktopStats: {
            period,
            setPeriod,
            count: stats.count,
            totalValue: stats.totalValue,
            monthRides,
            isLoading,
        } satisfies DashboardDesktopStats,
        mobileStats: {
            period,
            count: stats.count,
            totalValue: stats.totalValue,
        } satisfies DashboardMobileStats,
        rideActions: {
            editRide: rides.handleEditRide,
            requestRideDelete: rides.setRideToDelete,
        } satisfies DashboardRideActions,
        modals: {
            isRideModalOpen: rides.isRideModalOpen,
            setIsRideModalOpen: rides.setIsRideModalOpen,
            rideToEdit: rides.rideToEdit,
            setRideToEdit: rides.setRideToEdit,
            rideToDelete: rides.rideToDelete,
            setRideToDelete: rides.setRideToDelete,
            isDeletingRide: rides.isDeletingRide,
            confirmRideDelete: rides.handleDeleteRide,
        },
    };
}
