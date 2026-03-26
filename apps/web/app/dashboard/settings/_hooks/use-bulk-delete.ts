"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

export function useBulkDelete() {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    
    const [clientsProgress, setClientsProgress] = useState(0);
    const [ridesProgress, setRidesProgress] = useState(0);

    const deleteClientsMutation = useMutation({
        mutationFn: async () => {
            return apiClient.delete("/clients/all");
        },
        onSuccess: () => {
            setClientsProgress(100);
            queryClient.invalidateQueries({ queryKey: ["clients"] });
            queryClient.invalidateQueries({ queryKey: ["rides"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
            queryClient.invalidateQueries({ queryKey: ["frequent-clients"] });
            
            toast({
                title: "Todos os clientes excluídos",
                description: "Sua base de dados de clientes e todas as corridas associadas foram limpas.",
                duration: 5000,
            });
        },
        onError: () => {
            setClientsProgress(0);
            toast({
                title: "Erro ao excluir clientes",
                description: "Não foi possível realizar a exclusão em massa. Tente novamente.",
                variant: "destructive",
            });
        },
    });

    const deleteRidesMutation = useMutation({
        mutationFn: async () => {
            return apiClient.delete("/rides/all");
        },
        onSuccess: () => {
            setRidesProgress(100);
            queryClient.invalidateQueries({ queryKey: ["rides"] });
            queryClient.invalidateQueries({ queryKey: ["stats"] });
            queryClient.invalidateQueries({ queryKey: ["frequent-clients"] });
            
            toast({
                title: "Todas as corridas excluídas",
                description: "Seu histórico de corridas foi limpo e o contador foi resetado.",
                duration: 5000,
            });
        },
        onError: () => {
            setRidesProgress(0);
            toast({
                title: "Erro ao excluir corridas",
                description: "Não foi possível realizar a exclusão em massa. Tente novamente.",
                variant: "destructive",
            });
        },
    });

    // Simulated progress logic
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (deleteClientsMutation.isPending) {
            setClientsProgress(0);
            interval = setInterval(() => {
                setClientsProgress(prev => (prev >= 95 ? 95 : prev + Math.floor(Math.random() * 5) + 1));
            }, 200);
        }
        return () => clearInterval(interval);
    }, [deleteClientsMutation.isPending]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (deleteRidesMutation.isPending) {
            setRidesProgress(0);
            interval = setInterval(() => {
                setRidesProgress(prev => (prev >= 95 ? 95 : prev + Math.floor(Math.random() * 5) + 1));
            }, 200);
        }
        return () => clearInterval(interval);
    }, [deleteRidesMutation.isPending]);

    return {
        // Clients
        deleteAllClients: deleteClientsMutation.mutateAsync,
        isDeletingClients: deleteClientsMutation.isPending,
        clientsProgress,
        
        // Rides
        deleteAllRides: deleteRidesMutation.mutateAsync,
        isDeletingRides: deleteRidesMutation.isPending,
        ridesProgress,
    };
}
