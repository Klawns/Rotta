'use client';

import { useCallback } from 'react';
import { useDashboardRideDialogState } from './use-dashboard-ride-dialog-state';
import { useDeleteDashboardRide } from './use-delete-dashboard-ride';

export function useDashboardRides() {
  const dialogs = useDashboardRideDialogState();
  const { deleteRide, isDeletingRide } = useDeleteDashboardRide({
    onSuccess: () => {
      dialogs.setRideToDelete(null);
    },
  });

  const handleDeleteRide = useCallback(async () => {
    if (!dialogs.rideToDelete) {
      return;
    }

    deleteRide(dialogs.rideToDelete);
  }, [deleteRide, dialogs.rideToDelete]);

  return {
    isRideModalOpen: dialogs.isRideModalOpen,
    setIsRideModalOpen: dialogs.setIsRideModalOpen,
    rideToEdit: dialogs.rideToEdit,
    setRideToEdit: dialogs.setRideToEdit,
    rideToDelete: dialogs.rideToDelete,
    setRideToDelete: dialogs.setRideToDelete,
    isDeletingRide,
    handleEditRide: dialogs.handleEditRide,
    handleDeleteRide,
  };
}
