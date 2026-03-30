"use client";

import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/api-error";
import { ridesService } from "@/services/rides-service";
import type { Ride } from "@/types/rides";
import type { RideRegistrationModals } from "./ride-registration.types";

interface UseRideDialogsProps {
    onSuccess: () => void;
}

export function useRideDialogs({ onSuccess }: UseRideDialogsProps) {
    const { toast } = useToast();

    const [rideToEdit, setRideToEdit] = useState<Ride | null>(null);
    const [rideToDelete, setRideToDelete] = useState<Ride | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDeleteRide = useCallback(async () => {
        if (!rideToDelete) {
            return;
        }

        setIsDeleting(true);
        try {
            await ridesService.deleteRide(rideToDelete.id);
            toast({ title: "Corrida excluida" });
            onSuccess();
            setRideToDelete(null);
        } catch (error) {
            toast({
                title: parseApiError(error, "Erro ao excluir"),
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    }, [onSuccess, rideToDelete, toast]);

    return useMemo<RideRegistrationModals>(
        () => ({
            rideToEdit,
            setRideToEdit,
            rideToDelete,
            setRideToDelete,
            isDeleting,
            handleDeleteRide,
        }),
        [handleDeleteRide, isDeleting, rideToDelete, rideToEdit],
    );
}
