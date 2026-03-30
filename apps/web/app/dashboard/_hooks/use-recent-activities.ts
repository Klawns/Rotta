"use client";

import { useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { parseApiError } from "@/lib/api-error";
import { clientKeys, financeKeys, rideKeys } from "@/lib/query-keys";
import { ridesService } from "@/services/rides-service";
import type { Ride } from "@/types/rides";
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
    const queryClient = useQueryClient();

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

    const { mutateAsync: togglePaymentStatus } = useMutation({
        mutationFn: (ride: Ride) => {
            const paymentStatus = ride.paymentStatus === "PAID" ? "PENDING" : "PAID";
            return ridesService.updateRideStatus(ride.id, { paymentStatus });
        },
        onSuccess: async () => {
            toast.success("Status atualizado");
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: rideKeys.all }),
                queryClient.invalidateQueries({ queryKey: clientKeys.all }),
                queryClient.invalidateQueries({ queryKey: financeKeys.all }),
            ]);
        },
        onError: (error) => {
            toast.error(parseApiError(error, "Erro ao atualizar status"));
        },
    });

    return {
        rides,
        isInitialLoading: isLoading && rides.length === 0,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage: !!hasNextPage,
        fetchNextPage,
        togglePaymentStatus,
        refetch,
    };
}
