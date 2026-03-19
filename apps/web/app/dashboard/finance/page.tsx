"use client";

import { useFinanceData } from "./_hooks/use-finance-data";
import { useExportPdf } from "./_hooks/use-export-pdf";
import { FinanceHeader } from "./_components/finance-header";
import { FinanceFilters } from "./_components/finance-filters";
import { StatsCard } from "./_components/stats-card";
import { ExportDialog } from "./_components/export-dialog";

export default function FinancePage() {
    const {
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
    } = useFinanceData();

    const {
        isPixModalOpen,
        setIsPixModalOpen,
        pixKey,
        setPixKey,
        handleExportPDF,
        confirmExport,
    } = useExportPdf({
        viewStats,
        selectedPeriod,
        userName: user?.name || "Motorista",
    });

    if (isLoading && !viewStats) {
        return (
            <div className="flex justify-center py-20">
                <div className="h-10 w-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            <header className="flex flex-col gap-6">
                <FinanceHeader
                    title="Financeiro"
                    subtitle="Acompanhe e exporte seus rendimentos."
                />

                <FinanceFilters
                    clients={clients}
                    selectedClientId={selectedClientId}
                    setSelectedClientId={setSelectedClientId}
                    selectedPeriod={selectedPeriod}
                    setSelectedPeriod={setSelectedPeriod}
                    startDate={startDate}
                    setStartDate={setStartDate}
                    endDate={endDate}
                    setEndDate={setEndDate}
                />
            </header>

            <StatsCard
                viewStats={viewStats}
                isLoading={isLoading}
                currentPeriod={currentPeriod}
                onExport={handleExportPDF}
            />

            <ExportDialog
                isOpen={isPixModalOpen}
                onOpenChange={setIsPixModalOpen}
                pixKey={pixKey}
                setPixKey={setPixKey}
                onConfirm={confirmExport}
            />
        </div>
    );
}
