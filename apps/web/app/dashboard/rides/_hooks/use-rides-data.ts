"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useClients } from "@/providers/clients-provider";
import { Ride, Client, FrequentClient, RidesFilterState } from "../types";
import { ridesService, RidesParams } from "../_services/rides-service";

interface UseRidesDataProps {
    page: number;
    pageSize: number;
    filters: RidesFilterState;
    setTotalCount: (total: number) => void;
}

export function useRidesData({ page, pageSize, filters, setTotalCount }: UseRidesDataProps) {
    const [rides, setRides] = useState<Ride[]>([]);
    const [frequentClients, setFrequentClients] = useState<FrequentClient[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFrequentLoading, setIsFrequentLoading] = useState(false);
    const { user } = useAuth();
    const { clients } = useClients();

    // 1. Busca de Corridas (Depende de paginação e filtros)
    const fetchRides = useCallback(async () => {
        if (!user) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const params: RidesParams = {
                limit: pageSize,
                offset: (page - 1) * pageSize,
                status: filters.statusFilter !== "all" ? filters.statusFilter : undefined,
                paymentStatus: filters.paymentFilter !== "all" ? filters.paymentFilter : undefined,
                clientId: filters.clientFilter !== "all" ? filters.clientFilter : undefined,
                startDate: filters.startDate || undefined,
                endDate: filters.endDate || undefined,
                search: filters.search || undefined
            };

            const ridesRes = await ridesService.getRides(params);
            const ridesData = ridesRes.data.rides || [];
            const total = ridesRes.data.total || 0;

            const clientMap = new Map(clients.map((c: Client) => [c.id, c.name]));

            const enrichedRides = ridesData.map((r: Ride) => ({
                ...r,
                clientName: r.client?.name || r.clientName || clientMap.get(r.clientId) || "Cliente Removido"
            }));

            setRides(enrichedRides);
            setTotalCount(total);
        } catch (err) {
            console.error("[useRidesData] Erro ao buscar corridas", err);
        } finally {
            setIsLoading(false);
        }
    }, [page, pageSize, filters, user, clients, setTotalCount]);

    // 2. Busca de Clientes Frequentes (Independente de filtros de pesquisa/página)
    const fetchFrequentClients = useCallback(async () => {
        if (!user) return;
        setIsFrequentLoading(true);
        try {
            const frequentRes = await ridesService.getFrequentClients();
            setFrequentClients(frequentRes.data);
        } catch (err) {
            console.error("[useRidesData] Erro ao buscar clientes frequentes", err);
        } finally {
            setIsFrequentLoading(false);
        }
    }, [user]);

    // Efeito para Corridas: Dispara quando filtros/página mudam
    useEffect(() => {
        fetchRides();
    }, [fetchRides]);

    // Efeito para Clientes Frequentes: Dispara apenas no mount (ou quando usuário muda)
    useEffect(() => {
        fetchFrequentClients();
    }, [fetchFrequentClients]);

    const togglePaymentStatus = useCallback(async (ride: Ride) => {
        const newStatus = ride.paymentStatus === 'PAID' ? 'PENDING' : 'PAID';
        try {
            await ridesService.updatePaymentStatus(ride.id, newStatus);
            await fetchRides();
        } catch (err) {
            console.error("[useRidesData] Erro ao atualizar status de pagamento", err);
        }
    }, [fetchRides]);

    return {
        rides,
        clients,
        frequentClients,
        isLoading,
        isFrequentLoading,
        fetchRides,
        fetchFrequentClients,
        togglePaymentStatus
    };
}
