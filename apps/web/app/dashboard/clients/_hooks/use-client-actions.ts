"use client";

import { useState } from "react";
import { clientService } from "../_services/client-service";
import { rideService } from "../_services/ride-service";

export function useClientActions() {
    const [isSettling, setIsSettling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeletingRide, setIsDeletingRide] = useState(false);

    const togglePin = async (clientId: string, isPinned: boolean) => {
        try {
            await clientService.togglePin(clientId, isPinned);
            return true;
        } catch (err) {
            alert("Erro ao fixar cliente");
            return false;
        }
    };

    const closeDebt = async (clientId: string) => {
        setIsSettling(true);
        try {
            await clientService.closeDebt(clientId);
            return true;
        } catch (err) {
            alert("Erro ao fechar dívida.");
            return false;
        } finally {
            setIsSettling(false);
        }
    };

    const deleteClient = async (clientId: string) => {
        setIsDeleting(true);
        try {
            await clientService.deleteClient(clientId);
            return true;
        } catch (err) {
            alert("Erro ao excluir cliente. Verifique se ele possui dados vinculados.");
            return false;
        } finally {
            setIsDeleting(false);
        }
    };

    const deleteRide = async (rideId: string) => {
        setIsDeletingRide(true);
        try {
            await rideService.deleteRide(rideId);
            return true;
        } catch (err) {
            alert("Erro ao excluir corrida.");
            return false;
        } finally {
            setIsDeletingRide(false);
        }
    };

    return {
        isSettling,
        isDeleting,
        isDeletingRide,
        togglePin,
        closeDebt,
        deleteClient,
        deleteRide
    };
}
