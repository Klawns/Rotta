'use client';

import { PaymentStatus, RideListScope, RideViewModel } from '@/types/rides';
import { useRidesListViewModel } from '../_hooks/use-rides-list-view-model';
import { RidesListView } from './rides-list-view';

interface RidesListContainerProps {
  rides: RideViewModel[];
  totalCount: number;
  isLoading: boolean;
  isFetching?: boolean;
  hasNextPage?: boolean;
  onLoadMore?: () => void;
  isFetchingNextPage?: boolean;
  error?: unknown;
  loadMoreError?: unknown;
  retry?: () => void | Promise<unknown>;
  retryLoadMore?: () => void | Promise<unknown>;
  scope: RideListScope;
  onEdit: (ride: RideViewModel) => void;
  onDelete: (ride: RideViewModel) => void;
  onChangePaymentStatus: (
    ride: RideViewModel,
    status: PaymentStatus,
  ) => void | Promise<unknown>;
  isPaymentUpdating: (rideId: string) => boolean;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isSelectionMode: boolean;
  selectedCount: number;
  totalVisible: number;
  isRideSelected: (rideId: string) => boolean;
  onEnterSelectionMode: (rideId?: string) => void;
  onExitSelectionMode: () => void;
  onToggleRideSelection: (rideId: string) => void;
  onToggleSelectAllVisible: (isSelected: boolean) => void;
  isAllVisibleSelected: boolean;
  isSelectionIndeterminate: boolean;
  onDeleteSelected: () => void;
  isDeletingSelected: boolean;
  selectionActionLabel: string;
  selectionActionProgressLabel: string;
  selectionActionTone: 'brand' | 'success';
}

export function RidesListContainer({
  rides,
  totalCount,
  isLoading,
  isFetching,
  hasNextPage,
  onLoadMore,
  isFetchingNextPage,
  error,
  loadMoreError,
  retry,
  retryLoadMore,
  scope,
  onEdit,
  onDelete,
  onChangePaymentStatus,
  isPaymentUpdating,
  hasActiveFilters,
  onClearFilters,
  isSelectionMode,
  selectedCount,
  totalVisible,
  isRideSelected,
  onEnterSelectionMode,
  onExitSelectionMode,
  onToggleRideSelection,
  onToggleSelectAllVisible,
  isAllVisibleSelected,
  isSelectionIndeterminate,
  onDeleteSelected,
  isDeletingSelected,
  selectionActionLabel,
  selectionActionProgressLabel,
  selectionActionTone,
}: RidesListContainerProps) {
  const viewModel = useRidesListViewModel({
    rides,
    totalCount,
    isLoading,
    isFetching: !!isFetching,
    isFetchingNextPage,
    error,
    hasActiveFilters,
    scope,
  });

  return (
    <RidesListView
      viewModel={viewModel}
      actions={{
        onEdit,
        onDelete,
        onChangePaymentStatus,
        isPaymentUpdating,
        onClearFilters,
      }}
      selection={{
        isSelectionMode,
        selectedCount,
        totalVisible,
        isRideSelected,
        onEnterSelectionMode,
        onExitSelectionMode,
        onToggleRideSelection,
        onToggleSelectAllVisible,
        isAllVisibleSelected,
        isSelectionIndeterminate,
        onDeleteSelected,
        isDeletingSelected,
        selectionActionLabel,
        selectionActionProgressLabel,
        selectionActionTone,
      }}
      pagination={{
        hasNextPage,
        onLoadMore,
        isFetchingNextPage,
        loadMoreError,
        retry,
        retryLoadMore,
      }}
    />
  );
}
