"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/api-error";
import { settingsKeys } from "@/lib/query-keys";
import { settingsService } from "@/services/settings-service";
import { type RidePresetFormInput } from "@/types/settings";

function toPresetPayload(input: RidePresetFormInput) {
    return {
        label: input.location,
        value: Number(input.value),
        location: input.location,
    };
}

export function useRidePresets() {
    const { toast } = useToast();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const presetsQuery = useQuery({
        queryKey: settingsKeys.presets(),
        queryFn: ({ signal }) => settingsService.getRidePresets(signal),
        enabled: !!user,
    });

    const invalidatePresets = () =>
        queryClient.invalidateQueries({ queryKey: settingsKeys.presets() });

    const addPresetMutation = useMutation({
        mutationFn: (newPreset: RidePresetFormInput) =>
            settingsService.createRidePreset(toPresetPayload(newPreset)),
        onSuccess: async () => {
            await invalidatePresets();
            toast({
                title: "Atalho adicionado!",
                description: "Seu novo botao ja esta disponivel no painel mobile.",
            });
        },
        onError: (error) => {
            toast({
                title: "Erro ao adicionar",
                description: parseApiError(error, "Tente novamente mais tarde."),
                variant: "destructive",
            });
        },
    });

    const deletePresetMutation = useMutation({
        mutationFn: (id: string) => settingsService.deleteRidePreset(id),
        onSuccess: async () => {
            await invalidatePresets();
            toast({
                title: "Atalho removido",
                description: "O botao foi excluido com sucesso.",
            });
        },
        onError: (error) => {
            toast({
                title: "Erro ao remover",
                description: parseApiError(error, "Tente novamente mais tarde."),
                variant: "destructive",
            });
        },
    });

    const updatePresetMutation = useMutation({
        mutationFn: ({
            id,
            value,
            location,
        }: {
            id: string;
            value: number;
            location: string;
        }) =>
            settingsService.updateRidePreset(id, {
                label: location,
                value,
                location,
            }),
        onSuccess: async () => {
            await invalidatePresets();
            toast({ title: "Atalho atualizado!" });
        },
        onError: (error) => {
            toast({
                title: "Erro ao atualizar",
                description: parseApiError(error, "Tente novamente mais tarde."),
                variant: "destructive",
            });
        },
    });

    const addPreset = async (newPreset: RidePresetFormInput) => {
        if (!newPreset.value || !newPreset.location) {
            toast({
                title: "Campos obrigatorios",
                description: "Preencha valor e localidade.",
                variant: "destructive",
            });
            return false;
        }

        try {
            await addPresetMutation.mutateAsync(newPreset);
            return true;
        } catch {
            return false;
        }
    };

    const deletePreset = async (id: string) => {
        try {
            await deletePresetMutation.mutateAsync(id);
            return true;
        } catch {
            return false;
        }
    };

    const updatePreset = async (
        id: string,
        updateData: { value: number; location: string },
    ) => {
        try {
            await updatePresetMutation.mutateAsync({ id, ...updateData });
            return true;
        } catch {
            return false;
        }
    };

    return {
        presets: presetsQuery.data ?? [],
        isLoading: presetsQuery.isLoading,
        isSaving: addPresetMutation.isPending,
        isUpdating: updatePresetMutation.isPending,
        addPreset,
        deletePreset,
        updatePreset,
        refreshPresets: presetsQuery.refetch,
    };
}
