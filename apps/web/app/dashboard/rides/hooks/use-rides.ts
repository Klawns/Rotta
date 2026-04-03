"use client";

import { useRidesFilters } from "../_hooks/use-rides-filters";
import { useRidesData } from "../_hooks/use-rides-data";
import { useRidesModals } from "../_hooks/use-rides-modals";

const PAGE_SIZE = 10;

export function useRides() {
    const filters = useRidesFilters();

    const data = useRidesData({
        filters: filters.filterState,
        pageSize: PAGE_SIZE,
    });

    const modals = useRidesModals({
        onSuccess: data.fetchRides,
    });

    return {
        rides: data.rides,
        clients: data.clients,
        clientSearch: data.clientSearch,
        setClientSearch: data.setClientSearch,
        isLoadingClients: data.isLoadingClients,
        isFetchingClients: data.isFetchingClients,
        isClientDirectoryError: data.isClientDirectoryError,
        clientDirectoryError: data.clientDirectoryError,
        refetchClientDirectory: data.refetchClientDirectory,
        isClientDirectoryReady: data.isClientDirectoryReady,
        clientDirectoryMeta: data.clientDirectoryMeta,
        frequentClients: data.frequentClients,
        isLoading: data.isLoading,
        isFetching: data.isFetching,
        isFetchingNextPage: data.isFetchingNextPage,
        hasNextPage: data.hasNextPage,
        fetchNextPage: data.fetchNextPage,
        isFrequentLoading: data.isFrequentLoading,
        totalCount: data.totalCount,
        ridesError: data.ridesError,
        filterState: filters.filterState,
        isFiltersOpen: filters.isFiltersOpen,
        hasActiveFilters: filters.hasActiveFilters,
        setSearch: filters.setSearch,
        setPaymentFilter: filters.setPaymentFilter,
        setClientFilter: filters.setClientFilter,
        setStartDate: filters.setStartDate,
        setEndDate: filters.setEndDate,
        setIsFiltersOpen: filters.setIsFiltersOpen,
        clearFilters: filters.clearFilters,
        pageSize: PAGE_SIZE,
        ...modals,
        fetchData: data.fetchRides,
        fetchFrequentClients: data.fetchFrequentClients,
        setPaymentStatus: data.setPaymentStatus,
        isUpdatingRide: data.isUpdatingRide,
    };
}
