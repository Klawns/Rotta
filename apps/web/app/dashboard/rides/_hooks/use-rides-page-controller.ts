'use client';

import { useCallback } from 'react';
import { useRides } from '../hooks/use-rides';

export function useRidesPageController() {
  const rides = useRides();

  const handleRideSuccess = useCallback(async () => {
    await rides.fetchData();
    rides.closeRideModal();
  }, [rides]);

  return {
    header: {
      onNewRide: rides.openCreateModal,
    },
    frequentClients: {
      clients: rides.frequentClients,
      isLoading: rides.isFrequentLoading,
      onSelectClient: rides.openQuickCreateModal,
    },
    filters: {
      filters: rides.filterState,
      setSearch: rides.setSearch,
      setPaymentFilter: rides.setPaymentFilter,
      setClientFilter: rides.setClientFilter,
      setStartDate: rides.setStartDate,
      setEndDate: rides.setEndDate,
      isFiltersOpen: rides.isFiltersOpen,
      setIsFiltersOpen: rides.setIsFiltersOpen,
      hasActiveFilters: rides.hasActiveFilters,
      onClearFilters: rides.clearFilters,
      clients: rides.clients,
    },
    ridesList: {
      rides: rides.rides,
      isLoading: rides.isLoading,
      isFetching: rides.isFetching,
      hasNextPage: rides.hasNextPage,
      onLoadMore: rides.fetchNextPage,
      isFetchingNextPage: rides.isFetchingNextPage,
      error: rides.ridesError,
      retry: rides.fetchData,
      onEdit: rides.handleEditRide,
      onDelete: rides.setRideToDelete,
      onTogglePayment: rides.togglePaymentStatus,
      hasActiveFilters: rides.hasActiveFilters,
      onClearFilters: rides.clearFilters,
    },
    rideDialog: {
      isOpen: rides.isRideModalOpen,
      onClose: rides.closeRideModal,
      onSuccess: handleRideSuccess,
      rideToEdit: rides.rideToEdit || undefined,
      clientId: rides.selectedQuickClient?.id,
      clientName: rides.selectedQuickClient?.name,
    },
    deleteDialog: {
      isOpen: !!rides.rideToDelete,
      onClose: () => rides.setRideToDelete(null),
      onConfirm: rides.handleDeleteRide,
      isLoading: rides.isDeleting,
    },
  };
}
