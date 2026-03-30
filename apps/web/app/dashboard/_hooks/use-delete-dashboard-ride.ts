"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/api-error";
import { clientKeys, rideKeys } from "@/lib/query-keys";
import { ridesService } from "@/services/rides-service";

interface UseDeleteDashboardRideProps {
    onDeleted?: () => void;
    onSuccess?: () => void;
}

export function useDeleteDashboardRide({
    onDeleted,
    onSuccess,
}: UseDeleteDashboardRideProps = {}) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: string) => ridesService.deleteRide(id),
        onSuccess: async () => {
            toast({ title: "Corrida excluida com sucesso" });
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: rideKeys.all }),
                queryClient.invalidateQueries({ queryKey: clientKeys.all }),
            ]);
            onSuccess?.();
            onDeleted?.();
        },
        onError: (error) => {
            toast({
                title: parseApiError(error, "Erro ao excluir corrida"),
                variant: "destructive",
            });
        },
    });

    return {
        deleteRide: mutation.mutate,
        isDeletingRide: mutation.isPending,
    };
}
