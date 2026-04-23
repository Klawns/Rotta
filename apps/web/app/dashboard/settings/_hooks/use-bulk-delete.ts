"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { clearClientCaches } from "@/lib/client-cache";
import { clearRideCaches } from "@/lib/ride-cache";
import { authKeys, financeKeys, rideKeys } from "@/lib/query-keys";
import { clientsService } from "@/services/clients-service";
import { ridesService } from "@/services/rides-service";

const RIDE_STATS_KEY = [...rideKeys.all, "stats"] as const;

export function useBulkDelete() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const deleteClientsMutation = useMutation({
        mutationFn: () => clientsService.deleteAllClients(),
        onSuccess: async () => {
            clearClientCaches(queryClient);
            clearRideCaches(queryClient);

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: RIDE_STATS_KEY }),
                queryClient.invalidateQueries({ queryKey: financeKeys.all }),
                queryClient.invalidateQueries({ queryKey: authKeys.user() }),
            ]);

            toast({
                title: "Todos os clientes excluídos",
                description: "Sua base de dados de clientes e todas as corridas associadas foram limpas.",
                duration: 5000,
            });
        },
        onError: () => {
            toast({
                title: "Erro ao excluir clientes",
                description: "Não foi possível realizar a exclusão em massa. Tente novamente.",
                variant: "destructive",
            });
        },
    });

    const deleteRidesMutation = useMutation({
        mutationFn: () => ridesService.deleteAllRides(),
        onSuccess: async () => {
            clearRideCaches(queryClient);

            await Promise.all([
                queryClient.invalidateQueries({ queryKey: RIDE_STATS_KEY }),
                queryClient.invalidateQueries({ queryKey: financeKeys.all }),
                queryClient.invalidateQueries({ queryKey: authKeys.user() }),
            ]);

            toast({
                title: "Todas as corridas excluídas",
                description: "Seu histórico de corridas foi limpo e o contador foi resetado.",
                duration: 5000,
            });
        },
        onError: () => {
            toast({
                title: "Erro ao excluir corridas",
                description: "Não foi possível realizar a exclusão em massa. Tente novamente.",
                variant: "destructive",
            });
        },
    });

    return {
        deleteAllClients: deleteClientsMutation.mutateAsync,
        isDeletingClients: deleteClientsMutation.isPending,
        deleteAllRides: deleteRidesMutation.mutateAsync,
        isDeletingRides: deleteRidesMutation.isPending,
    };
}
