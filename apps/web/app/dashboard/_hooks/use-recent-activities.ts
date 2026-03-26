"use client";

import { useMemo } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { ridesService } from "@/services/rides-service";
import { Ride } from "@/types/rides";
import { toast } from "sonner";
import { rideKeys } from "@/lib/query-keys";
import { startOfDay, subDays } from "date-fns";

interface UseRecentActivitiesProps {
    period: 'today' | 'week';
}

/**
 * Hook dedicado para gerenciar a lista infinita de atividades recentes no Dashboard.
 * Sincroniza com o período selecionado (hoje/semana).
 */
export function useRecentActivities({ period }: UseRecentActivitiesProps) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    // Calcula as datas de início e fim baseadas no período
    const dateFilters = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        if (period === 'today') {
            startDate = startOfDay(now);
        } else {
            // week: últimos 7 dias
            startDate = startOfDay(subDays(now, 7));
        }

        return {
            startDate: startDate.toISOString(),
            // Não enviamos endDate para pegar tudo até o momento
        };
    }, [period]);

    const activeFilters = useMemo(() => ({
        limit: 10,
        startDate: dateFilters.startDate,
    }), [dateFilters]);

    // Query Infinita para atividades recentes
    const {
        data: ridesData,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        refetch
    } = useInfiniteQuery({
        queryKey: rideKeys.infinite({ ...activeFilters, dashboard: true }),
        queryFn: ({ pageParam, signal }) => ridesService.getRides({
            ...activeFilters,
            cursor: pageParam as string | undefined,
        }, signal),
        initialPageParam: undefined as string | undefined,
        getNextPageParam: (lastPage) => lastPage.meta?.hasMore ? lastPage.meta.nextCursor : undefined,
        enabled: !!user,
        staleTime: 60000, // 1 minuto
    });

    const rides = useMemo(() => {
        const allRides = ridesData?.pages.flatMap(page => page.data) || [];
        // Deduplicação básica
        return Array.from(new Map(allRides.map(r => [r.id, r])).values());
    }, [ridesData]);

    // Mutação para atualizar status (reutilizada para conveniência aqui)
    const { mutateAsync: togglePaymentStatus } = useMutation({
        mutationFn: (ride: Ride) => {
            const newStatus = ride.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
            return ridesService.updateRideStatus(ride.id, { paymentStatus: newStatus });
        },
        onSuccess: () => {
            toast.success("Status atualizado");
            queryClient.invalidateQueries({ queryKey: ["rides-infinite"] });
            // Também invalida estatísticas pois o valor pago mudou
            queryClient.invalidateQueries({ queryKey: ["rides-stats"] });
        }
    });

    return {
        rides,
        isLoading,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        togglePaymentStatus,
        refetch
    };
}
