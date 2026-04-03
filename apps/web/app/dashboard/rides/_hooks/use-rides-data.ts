"use client";

import { useDeferredValue, useMemo, useState } from "react";
import {
    useInfiniteQuery,
    useQuery,
} from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useClientDirectory } from "@/hooks/use-client-directory";
import { useRidePaymentStatus } from "@/hooks/use-ride-payment-status";
import { rideKeys } from "@/lib/query-keys";
import { ridesService } from "@/services/rides-service";
import { RideViewModel, RidesFilterState } from "@/types/rides";

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

function getUniqueRides(rides: RideViewModel[]) {
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
    const [clientSearch, setClientSearch] = useState("");
    const deferredClientSearch = useDeferredValue(clientSearch.trim());
    const selectedClientId =
        filters.clientFilter && filters.clientFilter !== "all"
            ? filters.clientFilter
            : undefined;
    const clientDirectory = useClientDirectory({
        search: deferredClientSearch,
        limit: 20,
        selectedClientId,
    });
    const paymentStatus = useRidePaymentStatus();

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

    return {
        rides,
        totalCount: rides.length,
        clients: clientDirectory.clients,
        clientSearch,
        setClientSearch,
        isLoadingClients: clientDirectory.isLoading,
        isFetchingClients: clientDirectory.isFetching,
        isClientDirectoryError: clientDirectory.isError,
        clientDirectoryError: clientDirectory.error,
        refetchClientDirectory: clientDirectory.refetch,
        isClientDirectoryReady: clientDirectory.isReady,
        clientDirectoryMeta: clientDirectory.meta,
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
        setPaymentStatus: paymentStatus.setPaymentStatus,
        isUpdatingRide: paymentStatus.isUpdatingRide,
    };
}
