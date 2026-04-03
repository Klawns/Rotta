"use client";

import { useCallback, useState } from "react";
import type { RideViewModel } from "@/types/rides";

export function useDashboardRideDialogState() {
    const [isRideModalOpen, setIsRideModalOpen] = useState(false);
    const [rideToEdit, setRideToEdit] = useState<RideViewModel | null>(null);
    const [rideToDelete, setRideToDelete] = useState<RideViewModel | null>(null);

    const handleEditRide = useCallback((ride: RideViewModel) => {
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
