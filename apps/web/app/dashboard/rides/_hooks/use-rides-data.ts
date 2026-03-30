"use client";

import { useMemo } from "react";
import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useClientDirectory } from "@/hooks/use-client-directory";
import { parseApiError } from "@/lib/api-error";
import { clientKeys, financeKeys, rideKeys } from "@/lib/query-keys";
import { ridesService } from "@/services/rides-service";
import { Ride, RidesFilterState } from "@/types/rides";

interface UseRidesDataProps {
    filters: RidesFilterState;
    pageSize: number;
}

function buildRideFilters(filters: RidesFilterState, pageSize: number) {
    return {
        limit: pageSize,
        paymentStatus:
            filters.paymentFilter !== "all" ? filters.paymentFilter : undefined,
        clientId: filters.clientFilter !== "all" ? filters.clientFilter : undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        search: filters.search || undefined,
    };
}

function getUniqueRides(rides: Ride[]) {
    return Array.from(
        new Map(
            rides
                .filter((ride) => ride?.id)
                .map((ride) => [String(ride.id), ride]),
        ).values(),
    );
}

export function useRidesData({ filters, pageSize }: UseRidesDataProps) {
    const { user } = useAuth();
    const { clients } = useClientDirectory();
    const queryClient = useQueryClient();

    const activeFilters = useMemo(
        () => buildRideFilters(filters, pageSize),
        [filters, pageSize],
    );

    const {
        data: ridesData,
        isLoading: isRidesLoading,
        isFetching: isRidesFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        error: ridesError,
        refetch: fetchRides,
    } = useInfiniteQuery({
        queryKey: rideKeys.infinite(activeFilters),
        queryFn: ({ pageParam, signal }) =>
            ridesService.getRides(
                {
                    ...activeFilters,
                    cursor: pageParam as string | undefined,
                },
                signal,
            ),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) =>
            lastPage.meta?.hasNextPage ? lastPage.meta.nextCursor : undefined,
        enabled: !!user,
        staleTime: 120000,
        gcTime: 300000,
    });

    const allRides = ridesData?.pages.flatMap((page) => page.data) || [];
    const rides = getUniqueRides(allRides);

    const {
        data: frequentClients = [],
        isLoading: isFrequentLoading,
        refetch: fetchFrequentClients,
    } = useQuery({
        queryKey: rideKeys.frequentClients(),
        queryFn: ({ signal }) => ridesService.getFrequentClients(signal),
        enabled: !!user,
    });

    const { mutateAsync: togglePaymentStatus } = useMutation({
        mutationFn: (ride: Ride) => {
            const newStatus = ride.paymentStatus === "PAID" ? "PENDING" : "PAID";
            return ridesService.updateRideStatus(ride.id, {
                paymentStatus: newStatus,
            });
        },
        onSuccess: () => {
            toast.success("Status de pagamento atualizado");
            queryClient.invalidateQueries({ queryKey: rideKeys.all });
            queryClient.invalidateQueries({ queryKey: clientKeys.all });
            queryClient.invalidateQueries({ queryKey: financeKeys.all });
        },
        onError: (error) => {
            toast.error(
                parseApiError(error, "Falha ao atualizar status de pagamento"),
            );
        },
    });

    return {
        rides,
        totalCount: rides.length,
        clients,
        frequentClients,
        isLoading: isRidesLoading,
        isFetching: isRidesFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        isFrequentLoading,
        ridesError,
        fetchRides,
        fetchFrequentClients,
        togglePaymentStatus,
    };
}
