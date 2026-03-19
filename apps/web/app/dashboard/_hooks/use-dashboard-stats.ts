"use client";

import { useState, useEffect, useCallback } from "react";
import { User } from "@/hooks/use-auth";
import { api } from "@/services/api";
import { Ride } from "../rides/types";

export type Period = 'today' | 'week';

interface DashboardStats {
    count: number;
    totalValue: number;
    rides: Ride[];
}

/**
 * Hook especializado para busca e gerenciamento de estatísticas do dashboard.
 */
export function useDashboardStats(user: User | null) {
    const [period, setPeriod] = useState<Period>('today');
    const [stats, setStats] = useState<DashboardStats>({ count: 0, totalValue: 0, rides: [] });
    const [monthRides, setMonthRides] = useState<Ride[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchStats = useCallback(async () => {
        if (!user) return;
        
        try {
            setIsLoading(true);
            const [statsRes, monthRes] = await Promise.all([
                api.get(`/rides/stats?period=${period}`),
                api.get('/rides/stats?period=month')
            ]);
            
            setStats(statsRes.data);
            setMonthRides(monthRes.data.rides || []);
        } catch (err) {
            console.error("[DashboardStats] Erro ao buscar estatísticas:", err);
        } finally {
            setIsLoading(false);
        }
    }, [period, user]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        period,
        setPeriod,
        stats,
        monthRides,
        isLoading,
        fetchStats
    };
}
