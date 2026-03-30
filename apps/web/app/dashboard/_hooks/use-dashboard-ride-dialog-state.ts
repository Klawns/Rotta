"use client";

import { useCallback, useState } from "react";
import type { Ride } from "@/types/rides";

export function useDashboardRideDialogState() {
    const [isRideModalOpen, setIsRideModalOpen] = useState(false);
    const [rideToEdit, setRideToEdit] = useState<Ride | null>(null);
    const [rideToDelete, setRideToDelete] = useState<Ride | null>(null);

    const handleEditRide = useCallback((ride: Ride) => {
        setRideToEdit(ride);
        setIsRideModalOpen(true);
    }, []);

    return {
        isRideModalOpen,
        setIsRideModalOpen,
        rideToEdit,
        setRideToEdit,
        rideToDelete,
        setRideToDelete,
        handleEditRide,
    };
}
