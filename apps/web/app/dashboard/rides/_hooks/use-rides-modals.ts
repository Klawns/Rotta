"use client";

import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/api-error";
import { ridesService } from "@/services/rides-service";
import { type RideViewModel } from "@/types/rides";

interface UseRidesModalsProps {
    onSuccess: () => Promise<unknown> | void;
}

export function useRidesModals({ onSuccess }: UseRidesModalsProps) {
    const [isRideModalOpen, setIsRideModalOpen] = useState(false);
    const [selectedQuickClient, setSelectedQuickClient] = useState<{
        id: string;
        name: string;
    } | null>(null);
    const [rideToEdit, setRideToEdit] = useState<RideViewModel | null>(null);
    const [rideToDelete, setRideToDelete] = useState<RideViewModel | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();

    const handleEditRide = useCallback((ride: RideViewModel) => {
        setRideToEdit(ride);
        setIsRideModalOpen(true);
    }, []);

    const handleDeleteRide = useCallback(async () => {
        if (!rideToDelete) {
            return;
        }

        setIsDeleting(true);

        try {
            await ridesService.deleteRide(rideToDelete.id);
            toast({
                title: "Corrida excluida",
                description: "A corrida foi removida com sucesso.",
            });
            await onSuccess();
            setRideToDelete(null);
        } catch (error) {
            toast({
                title: "Erro ao excluir",
                description: parseApiError(
                    error,
                    "Nao foi possivel excluir a corrida. Tente novamente.",
                ),
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    }, [onSuccess, rideToDelete, toast]);

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
        isDeleting,
        handleEditRide,
        handleDeleteRide,
        openCreateModal,
        openQuickCreateModal,
        closeRideModal,
    };
}
