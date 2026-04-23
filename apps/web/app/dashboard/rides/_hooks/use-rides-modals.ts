'use client';

import { useCallback, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDeleteRideMutation } from '@/hooks/mutations/use-delete-ride-mutation';
import { parseApiError } from '@/lib/api-error';
import { type RideViewModel } from '@/types/rides';

export function useRidesModals() {
    const [isRideModalOpen, setIsRideModalOpen] = useState(false);
    const [selectedQuickClient, setSelectedQuickClient] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [rideToEdit, setRideToEdit] = useState<RideViewModel | null>(null);
    const [rideToDelete, setRideToDelete] = useState<RideViewModel | null>(null);
    const { toast } = useToast();
    const deleteRideMutation = useDeleteRideMutation({
        onSuccess: async () => {
            toast({
                title: 'Corrida excluída',
                description: 'A corrida foi removida com sucesso.',
            });
            setRideToDelete(null);
        },
        onError: async (error) => {
            toast({
                title: 'Erro ao excluir',
                description: parseApiError(
                    error,
                    'Não foi possível excluir a corrida. Tente novamente.',
                ),
                variant: 'destructive',
            });
        },
    });

    const handleEditRide = useCallback((ride: RideViewModel) => {
        setRideToEdit(ride);
        setIsRideModalOpen(true);
    }, []);

    const handleDeleteRide = useCallback(async () => {
        if (!rideToDelete) {
            return;
        }

        await deleteRideMutation.mutateAsync(rideToDelete);
    }, [deleteRideMutation, rideToDelete]);

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
        rideToDelete,
        setRideToDelete,
        isDeleting: deleteRideMutation.isPending,
        handleEditRide,
        handleDeleteRide,
        openCreateModal,
        openQuickCreateModal,
        closeRideModal,
    };
}
