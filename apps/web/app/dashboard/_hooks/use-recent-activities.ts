"use client";

import { useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRidePaymentStatus } from "@/hooks/use-ride-payment-status";
import {
    buildRecentActivityFilters,
    getUniqueRecentActivityRides,
} from "./recent-activities.utils";
import { useRecentActivitiesQuery } from "./use-recent-activities-query";

interface UseRecentActivitiesProps {
    period: "today" | "week";
}

export function useRecentActivities({ period }: UseRecentActivitiesProps) {
    const { user } = useAuth();
    const paymentStatus = useRidePaymentStatus();

    const filters = useMemo(() => buildRecentActivityFilters(period), [period]);
    const {
        data,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch,
    } = useRecentActivitiesQuery(filters, !!user);

    const rides = useMemo(() => {
        const allRides = data?.pages.flatMap((page) => page.data) || [];
        return getUniqueRecentActivityRides(allRides);
    }, [data]);

    return {
        rides,
        isInitialLoading: isLoading && rides.length === 0,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage: !!hasNextPage,
        fetchNextPage,
        setPaymentStatus: paymentStatus.setPaymentStatus,
        isUpdatingRide: paymentStatus.isUpdatingRide,
        refetch,
    };
}
