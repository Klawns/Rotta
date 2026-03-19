"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useClients } from "@/providers/clients-provider";
import { financeService } from "../_services/finance-service";
import { FinanceStats, PeriodId, Period, PERIODS } from "../_types";

export function useFinanceData() {
    const { user } = useAuth();
    const { clients } = useClients();
    const [selectedClientId, setSelectedClientId] = useState<string>("all");
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodId>("month");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [viewStats, setViewStats] = useState<FinanceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        if (selectedPeriod === "custom" && (!startDate || !endDate)) return;

        let cancelled = false;

        const loadStats = async () => {
            setIsLoading(true);
            try {
                const stats = await financeService.fetchStats({
                    period: selectedPeriod,
                    clientId: selectedClientId,
                    startDate,
                    endDate,
                });

                if (cancelled) return;
                setViewStats(stats);
            } catch (err) {
                console.error("Erro ao carregar dados financeiros", err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };

        loadStats();

        return () => {
            cancelled = true;
        };
    }, [selectedClientId, selectedPeriod, startDate, endDate, user]);

    const currentPeriod: Period = PERIODS.find((p) => p.id === selectedPeriod) || PERIODS[0];

    return {
        user,
        clients,
        selectedClientId,
        setSelectedClientId,
        selectedPeriod,
        setSelectedPeriod,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        viewStats,
        isLoading,
        currentPeriod,
    };
}
