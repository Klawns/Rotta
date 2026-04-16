'use client';

import { useCallback, useMemo, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useDeleteRideMutation } from '@/hooks/mutations/use-delete-ride-mutation';
import { parseApiError } from '@/lib/api-error';
import type { RideViewModel } from '@/types/rides';
import type { RideRegistrationModals } from './ride-registration.types';

export function useRideDialogs() {
    const { toast } = useToast();

    const [rideToEdit, setRideToEdit] = useState<RideViewModel | null>(null);
    const [rideToDelete, setRideToDelete] = useState<RideViewModel | null>(null);
    const deleteRideMutation = useDeleteRideMutation({
        onSuccess: async () => {
            toast({ title: 'Corrida excluida' });
            setRideToDelete(null);
        },
        onError: async (error) => {
            toast({
                title: parseApiError(error, 'Erro ao excluir'),
                variant: 'destructive',
            });
        },
    });

    const handleDeleteRide = useCallback(async () => {
        if (!rideToDelete) {
            return;
        }

        await deleteRideMutation.mutateAsync(rideToDelete);
    }, [deleteRideMutation, rideToDelete]);

    return useMemo<RideRegistrationModals>(
        () => ({
            rideToEdit,
            setRideToEdit,
            rideToDelete,
            setRideToDelete,
            isDeleting: deleteRideMutation.isPending,
            handleDeleteRide,
        }),
        [deleteRideMutation.isPending, handleDeleteRide, rideToDelete, rideToEdit],
    );
}
