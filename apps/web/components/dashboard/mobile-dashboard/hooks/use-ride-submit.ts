"use client";

import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSubmitRideMutation } from "@/hooks/mutations/use-submit-ride-mutation";
import { parseApiError } from "@/lib/api-error";
import { type RidePhotoState } from "@/lib/ride-photo";
import type { Client, PaymentStatus } from "@/types/rides";

interface UseRideSubmitProps {
    selectedClient: Client | null;
    customValue: string;
    customLocation: string;
    paymentStatus: PaymentStatus;
    rideDate: string;
    notes: string;
    photo: RidePhotoState;
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
    resetForm,
    onSuccess,
}: UseRideSubmitProps) {
    const { toast } = useToast();
    const mutation = useSubmitRideMutation({
        onSuccess: async (_, variables) => {
            const clientName = selectedClient?.name || "cliente";
            const rideValue = Number(variables.draft.value);

            toast({
                title: "Corrida registrada!",
                description: `R$ ${rideValue.toFixed(2)} para ${clientName}`,
            });

            resetForm();
            await onSuccess();
        },
        onError: async (error) => {
            toast({
                title: parseApiError(error, "Erro ao registrar"),
                variant: "destructive",
            });
        },
    });

    const submitRide = useCallback(async () => {
        if (!selectedClient) {
            return;
        }

        const finalValue = Number(customValue);

        if (!finalValue) {
            toast({ title: "Selecione um valor", variant: "destructive" });
            return;
        }

        await mutation.mutateAsync({
            draft: {
                selectedClientId: selectedClient.id,
                value: String(finalValue),
                location: customLocation || "",
                notes,
                photo,
                rideDate,
                paymentStatus,
            },
        });
    }, [
        customLocation,
        customValue,
        mutation,
        notes,
        paymentStatus,
        photo,
        rideDate,
        selectedClient,
        toast,
    ]);

    return {
        submitRide,
        isSubmitting: mutation.isPending,
    };
}
