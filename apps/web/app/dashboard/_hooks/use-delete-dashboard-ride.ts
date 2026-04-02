"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/api-error";
import { clientKeys, financeKeys, rideKeys } from "@/lib/query-keys";
import { removeRideCaches } from "@/lib/ride-cache";
import { ridesService } from "@/services/rides-service";
import type { Ride } from "@/types/rides";

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
        mutationFn: (ride: Ride) => ridesService.deleteRide(ride.id),
        onSuccess: async (_, ride) => {
            removeRideCaches(queryClient, ride.id);

            const clientId = ride.clientId || ride.client?.id;
            const tasks = [
                queryClient.invalidateQueries({ queryKey: rideKeys.frequentClients() }),
                queryClient.invalidateQueries({ queryKey: financeKeys.all }),
            ];

            if (clientId) {
                tasks.push(
                    queryClient.invalidateQueries({
                        queryKey: clientKeys.detail(clientId),
                        exact: true,
                    }),
                );
                tasks.push(
                    queryClient.invalidateQueries({
                        queryKey: clientKeys.balance(clientId),
                        exact: true,
                    }),
                );
            }

            toast({ title: "Corrida excluida com sucesso" });
            await Promise.all(tasks);
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
