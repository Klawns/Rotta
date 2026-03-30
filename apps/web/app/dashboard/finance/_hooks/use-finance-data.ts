"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useClientDirectory } from "@/hooks/use-client-directory";
import { financeKeys } from "@/lib/query-keys";
import { financeService } from "@/services/finance-service";
import { PERIODS, Period, PeriodId } from "../_types";

export function useFinanceData() {
    const { user } = useAuth();
    const { clients } = useClientDirectory();

    const [selectedClientId, setSelectedClientId] = useState<string>("all");
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodId>("month");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const {
        data: viewStats = null,
        isLoading,
        isFetching,
        refetch,
    } = useQuery({
        queryKey: financeKeys.dashboard({
            period: selectedPeriod,
            clientId: selectedClientId,
            startDate,
            endDate,
        }),
        queryFn: ({ signal }) =>
            financeService.getDashboard(
                {
                    period: selectedPeriod,
                    clientId: selectedClientId !== "all" ? selectedClientId : undefined,
                    start: selectedPeriod === "custom" ? startDate : undefined,
                    end: selectedPeriod === "custom" ? endDate : undefined,
                },
                signal,
            ),
        enabled:
            !!user &&
            (selectedPeriod !== "custom" || (!!startDate && !!endDate)),
        staleTime: 60000,
    });

    const currentPeriod: Period =
        PERIODS.find((period) => period.id === selectedPeriod) || PERIODS[0];

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
        isFetching,
        refetch,
        currentPeriod,
    };
}
