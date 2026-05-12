'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDeleteRidesAction } from '@/hooks/use-delete-rides-action';
import { useRestoreRidesAction } from '@/hooks/use-restore-rides-action';
import { useRideSelection } from '@/hooks/use-ride-selection';
import { useRides } from '../hooks/use-rides';

export function getBulkDialogCopy(
  isArchivedScope: boolean,
  selectedCount: number,
) {
  if (isArchivedScope) {
    return {
      title: 'Restaurar corridas selecionadas',
      description:
        selectedCount === 1
          ? 'Deseja restaurar a corrida selecionada para a lista de ativas?'
          : `Deseja restaurar as ${selectedCount} corridas selecionadas para a lista de ativas?`,
      confirmText: 'Restaurar selecionadas',
      variant: 'success' as const,
    };
  }

  return {
    title: 'Arquivar corridas selecionadas',
    description:
      selectedCount === 1
        ? 'Deseja arquivar a corrida selecionada? Voce podera restaura-la depois.'
        : `Deseja arquivar as ${selectedCount} corridas selecionadas? Voce podera restaura-las depois.`,
    confirmText: 'Arquivar selecionadas',
    variant: 'danger' as const,
  };
}

export function getRideDialogCopy(isArchivedScope: boolean) {
  if (isArchivedScope) {
    return {
      title: 'Restaurar corrida',
      description: 'Deseja restaurar esta corrida para a lista de ativas?',
      confirmText: 'Restaurar',
      variant: 'success' as const,
    };
  }

  return {
    title: 'Arquivar corrida',
    description: 'Deseja mover esta corrida para arquivadas? Voce podera restaura-la depois.',
    confirmText: 'Arquivar',
    variant: 'danger' as const,
  };
}

export function useRidesPageController() {
  const rides = useRides();
  const bulkDeleteAction = useDeleteRidesAction({
    successLabel: {
      singular: '1 corrida arquivada com sucesso.',
      plural: (count) => `${count} corridas arquivadas com sucesso.`,
    },
    errorMessage: 'Erro ao arquivar corridas.',
  });
  const bulkRestoreAction = useRestoreRidesAction();
  const isArchivedScope = rides.filterState.scope === 'archived';
  const selection = useRideSelection({
    items: rides.rides,
  });
  const { exitSelectionMode, isSelectionMode } = selection;
  const [isBulkActionConfirmOpen, setIsBulkActionConfirmOpen] = useState(false);
  const selectedRides = useMemo(
    () => rides.rides.filter((ride) => selection.selectedIds.has(ride.id)),
    [rides.rides, selection.selectedIds],
  );
  const bulkDialogCopy = useMemo(
    () => getBulkDialogCopy(isArchivedScope, selection.selectedCount),
    [isArchivedScope, selection.selectedCount],
  );
  const rideDialogCopy = useMemo(
    () => getRideDialogCopy(isArchivedScope),
    [isArchivedScope],
  );
  const selectionActionTone: 'success' | 'brand' = isArchivedScope
    ? 'success'
    : 'brand';

  const handleRideSuccess = useCallback(async () => {
    await rides.fetchData();
    rides.closeRideModal();
  }, [rides]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        exitSelectionMode();
      }
    }

    if (!isSelectionMode) {
      return;
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [exitSelectionMode, isSelectionMode]);

  const handleConfirmBulkAction = useCallback(async () => {
    if (selectedRides.length === 0) {
      setIsBulkActionConfirmOpen(false);
      return;
    }

    const result = isArchivedScope
      ? await bulkRestoreAction.restoreRides(selectedRides)
      : await bulkDeleteAction.deleteRides(selectedRides);

    if (result.success) {
      exitSelectionMode();
      setIsBulkActionConfirmOpen(false);
    }
  }, [
    bulkDeleteAction,
    bulkRestoreAction,
    exitSelectionMode,
    isArchivedScope,
    selectedRides,
  ]);

  return {
    header: {
      onNewRide: rides.openCreateModal,
      totalCount: rides.totalCount,
      hasActiveFilters: rides.hasActiveFilters,
      scope: rides.filterState.scope,
    },
    frequentClients: {
      clients: rides.frequentClients,
      isLoading: rides.isFrequentLoading,
      onSelectClient: rides.openQuickCreateModal,
    },
    filters: {
      filters: rides.filterState,
      clientAutocomplete: rides.clientAutocomplete,
      activeFilterChips: rides.activeFilterChips,
      activeFilterCount: rides.activeFilterCount,
      setScope: rides.setScope,
      setSearch: rides.setSearch,
      setPaymentFilter: rides.setPaymentFilter,
      setStartDate: rides.setStartDate,
      setEndDate: rides.setEndDate,
      setPeriodPreset: rides.setPeriodPreset,
      isFiltersOpen: rides.isFiltersOpen,
      setIsFiltersOpen: rides.setIsFiltersOpen,
      hasActiveFilters: rides.hasActiveFilters,
      onClearFilters: rides.clearFilters,
      onNewRide: rides.openCreateModal,
    },
    ridesList: {
      rides: rides.rides,
      totalCount: rides.totalCount,
      isLoading: rides.isLoading,
      isFetching: rides.isFetching,
      hasNextPage: rides.hasNextPage,
      onLoadMore: rides.fetchNextPage,
      isFetchingNextPage: rides.isFetchingNextPage,
      error: rides.ridesError,
      loadMoreError: rides.loadMoreError,
      retry: rides.fetchData,
      retryLoadMore: rides.retryLoadMore,
      scope: rides.filterState.scope,
      onEdit: rides.handleEditRide,
      onDelete: rides.setRidePendingAction,
      onChangePaymentStatus: rides.setPaymentStatus,
      isPaymentUpdating: rides.isUpdatingRide,
      hasActiveFilters: rides.hasActiveFilters,
      onClearFilters: rides.clearFilters,
      isSelectionMode,
      selectedCount: selection.selectedCount,
      totalVisible: selection.totalVisible,
      isRideSelected: selection.isSelected,
      onEnterSelectionMode: selection.enterSelectionMode,
      onExitSelectionMode: exitSelectionMode,
      onToggleRideSelection: selection.toggleItem,
      onToggleSelectAllVisible: selection.selectAllVisible,
      isAllVisibleSelected: selection.isAllVisibleSelected,
      isSelectionIndeterminate: selection.isIndeterminate,
      onDeleteSelected: () => setIsBulkActionConfirmOpen(true),
      isDeletingSelected: isArchivedScope
        ? bulkRestoreAction.isRestoringRides
        : bulkDeleteAction.isDeletingRides,
      selectionActionLabel: isArchivedScope ? 'Restaurar' : 'Arquivar',
      selectionActionProgressLabel: isArchivedScope ? 'Restaurando...' : 'Arquivando...',
      selectionActionTone,
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
      isOpen: !!rides.ridePendingAction,
      onClose: () => rides.setRidePendingAction(null),
      onConfirm: rides.handleConfirmRideAction,
      isLoading: rides.isRideActionPending,
      ...rideDialogCopy,
    },
    bulkDeleteDialog: {
      isOpen: isBulkActionConfirmOpen && isSelectionMode,
      onClose: () => setIsBulkActionConfirmOpen(false),
      onConfirm: handleConfirmBulkAction,
      isLoading: isArchivedScope
        ? bulkRestoreAction.isRestoringRides
        : bulkDeleteAction.isDeletingRides,
      selectedCount: selection.selectedCount,
      ...bulkDialogCopy,
    },
  };
}
