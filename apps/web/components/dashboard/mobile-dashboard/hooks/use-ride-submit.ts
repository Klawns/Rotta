"use client";

import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/api-error";
import { submitRideDraft } from "@/components/ride-modal/lib/ride-submission";
import type { Client, PaymentStatus } from "@/types/rides";

interface UseRideSubmitProps {
    selectedClient: Client | null;
    customValue: string;
    customLocation: string;
    paymentStatus: PaymentStatus;
    rideDate: string;
    notes: string;
    photo: string | null;
    setIsSaving: (isSaving: boolean) => void;
    resetForm: () => void;
    onSuccess: () => void | Promise<void>;
}

export function useRideSubmit({
    selectedClient,
    customValue,
    customLocation,
    paymentStatus,
    rideDate,
    notes,
    photo,
    setIsSaving,
    resetForm,
    onSuccess,
}: UseRideSubmitProps) {
    const { toast } = useToast();

    return useCallback(async () => {
        if (!selectedClient) {
            return;
        }

        const finalValue = Number(customValue);

        if (!finalValue) {
            toast({ title: "Selecione um valor", variant: "destructive" });
            return;
        }

        setIsSaving(true);
        try {
            await submitRideDraft({
                selectedClientId: selectedClient.id,
                value: String(finalValue),
                location: customLocation || "",
                notes,
                photo,
                rideDate,
                paymentStatus,
            });

            toast({
                title: "Corrida registrada!",
                description: `R$ ${finalValue.toFixed(2)} para ${selectedClient.name}`,
            });

            resetForm();
            await onSuccess();
        } catch (error) {
            toast({
                title: parseApiError(error, "Erro ao registrar"),
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    }, [
        customLocation,
        customValue,
        notes,
        onSuccess,
        paymentStatus,
        photo,
        resetForm,
        rideDate,
        selectedClient,
        setIsSaving,
        toast,
    ]);
}
