'use client';

import { useCallback, useState } from 'react';
import { useDeleteRideMutation } from '@/hooks/mutations/use-delete-ride-mutation';
import { useRestoreRideMutation } from '@/hooks/mutations/use-restore-ride-mutation';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/api-error';
import { type RideListScope, type RideViewModel } from '@/types/rides';

export function useRidesModals(scope: RideListScope) {
  const [isRideModalOpen, setIsRideModalOpen] = useState(false);
  const [selectedQuickClient, setSelectedQuickClient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [rideToEdit, setRideToEdit] = useState<RideViewModel | null>(null);
  const [ridePendingAction, setRidePendingAction] = useState<RideViewModel | null>(null);
  const { toast } = useToast();
  const isArchivedScope = scope === 'archived';

  const deleteRideMutation = useDeleteRideMutation({
    onSuccess: async () => {
      toast({
        title: 'Corrida arquivada',
        description: 'A corrida foi movida para arquivadas com sucesso.',
      });
      setRidePendingAction(null);
    },
    onError: async (error) => {
      toast({
        title: 'Erro ao arquivar',
        description: parseApiError(
          error,
          'Nao foi possivel arquivar a corrida. Tente novamente.',
        ),
        variant: 'destructive',
      });
    },
  });

  const restoreRideMutation = useRestoreRideMutation({
    onSuccess: async () => {
      toast({
        title: 'Corrida restaurada',
        description: 'A corrida voltou para a lista de ativas.',
      });
      setRidePendingAction(null);
    },
    onError: async (error) => {
      toast({
        title: 'Erro ao restaurar',
        description: parseApiError(
          error,
          'Nao foi possivel restaurar a corrida. Tente novamente.',
        ),
        variant: 'destructive',
      });
    },
  });

  const handleEditRide = useCallback((ride: RideViewModel) => {
    setRideToEdit(ride);
    setIsRideModalOpen(true);
  }, []);

  const handleConfirmRideAction = useCallback(async () => {
    if (!ridePendingAction) {
      return;
    }

    if (isArchivedScope) {
      await restoreRideMutation.mutateAsync(ridePendingAction);
      return;
    }

    await deleteRideMutation.mutateAsync(ridePendingAction);
  }, [
    deleteRideMutation,
    isArchivedScope,
    restoreRideMutation,
    ridePendingAction,
  ]);

  const openCreateModal = useCallback(() => {
    setRideToEdit(null);
    setSelectedQuickClient(null);
    setIsRideModalOpen(true);
  }, []);

  const openQuickCreateModal = useCallback((id: string, name: string) => {
    setSelectedQuickClient({ id, name });
    setRideToEdit(null);
    setIsRideModalOpen(true);
  }, []);

  const closeRideModal = useCallback(() => {
    setIsRideModalOpen(false);
    setRideToEdit(null);
    setSelectedQuickClient(null);
  }, []);

  return {
    isRideModalOpen,
    setIsRideModalOpen,
    selectedQuickClient,
    setSelectedQuickClient,
    rideToEdit,
    setRideToEdit,
    ridePendingAction,
    setRidePendingAction,
    isRideActionPending:
      deleteRideMutation.isPending || restoreRideMutation.isPending,
    handleEditRide,
    handleConfirmRideAction,
    openCreateModal,
    openQuickCreateModal,
    closeRideModal,
  };
}
