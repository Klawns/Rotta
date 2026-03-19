"use client";

import { useState } from "react";
import { PDFService } from "@/services/pdf-service";
import { FinanceStats, PeriodId, ExportState } from "../_types";

interface UseExportPdfParams {
    viewStats: FinanceStats | null;
    selectedPeriod: PeriodId;
    userName: string;
}

export function useExportPdf({ viewStats, selectedPeriod, userName }: UseExportPdfParams) {
    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [pixKey, setPixKey] = useState("");
    const [statsToExport, setStatsToExport] = useState<ExportState | null>(null);

    const handleExportPDF = () => {
        if (!viewStats || !viewStats.rides.length) return;

        setStatsToExport({ period: selectedPeriod, stats: viewStats });
        setIsPixModalOpen(true);
    };

    const confirmExport = (includePix: boolean) => {
        if (!statsToExport) return;

        PDFService.generateReport(statsToExport.stats.rides, {
            period: statsToExport.period,
            userName,
            pixKey: includePix && pixKey.trim() !== "" ? pixKey : undefined,
        });

        setIsPixModalOpen(false);
        setStatsToExport(null);
    };

    return {
        isPixModalOpen,
        setIsPixModalOpen,
        pixKey,
        setPixKey,
        handleExportPDF,
        confirmExport,
    };
}
