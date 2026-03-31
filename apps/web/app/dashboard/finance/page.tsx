"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinanceDashboard } from "./_hooks/use-finance-dashboard";
import { useExportPdf } from "./_hooks/use-export-pdf";
import { useExportFinance } from "./_hooks/use-export-finance";
import { FinanceHeader } from "./_components/finance-header";
import { FinanceFilters } from "./_components/finance-filters";
import { ExportDialog } from "./_components/export-dialog";
import {
    RevenueTrendChart,
    ClientDistributionChart,
} from "./_components/finance-charts";
import { PaymentStatusBarChart } from "./_components/payment-status-bar-chart";
import { RecentActivity } from "./_components/recent-activity";
import { FinanceSkeleton } from "./_components/finance-skeleton";
import {
    ClientHighlightsCard,
    FinanceActionBar,
    FinanceHero,
    FinanceKpiGrid,
    PaymentSummaryCard,
    SelectedClientSummaryCard,
} from "./_components/finance-overview";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { PERIODS } from "./_types";

type FinanceTab = "overview" | "clients" | "payments" | "rides" | "history";

export default function FinancePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<FinanceTab>("overview");
    const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);
    const {
        data,
        isLoading,
        filters,
        setFilters,
        clients,
        currentPeriod,
    } = useFinanceDashboard();
    const isClientView = Boolean(filters.clientId && filters.clientId !== "all");
    const selectedClient = clients?.find((client) => client.id === filters.clientId) || null;
    const selectedClientName = isClientView
        ? selectedClient?.name || data?.recentRides?.[0]?.clientName || null
        : null;
    const resolvedActiveTab: FinanceTab = isClientView
        ? activeTab === "clients" || activeTab === "rides"
            ? "overview"
            : activeTab
        : activeTab === "history"
            ? "overview"
            : activeTab;

    const {
        isPixModalOpen,
        setIsPixModalOpen,
        pixKey,
        setPixKey,
        handleExportPDF,
        confirmExport,
    } = useExportPdf({
        viewStats: data?.summary || null,
        rides: data?.recentRides || [],
        selectedPeriod: filters.period,
        userName: user?.name || "Motorista",
    });

    const { exportToCSV } = useExportFinance();

    if (isLoading && !data) {
        return <FinanceSkeleton />;
    }

    return (
        <div className="space-y-6 pb-24">
            <header className="flex flex-col gap-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <FinanceHeader
                        title="Financeiro"
                        subtitle={
                            isClientView && selectedClientName
                                ? `Leitura focada em ${selectedClientName}.`
                                : "Resumo claro dos seus ganhos."
                        }
                    />
                </div>

                <FinanceFilters
                    clients={clients || []}
                    selectedClientId={filters.clientId || "all"}
                    setSelectedClientId={(id) => setFilters({ clientId: id })}
                    selectedPeriod={filters.period}
                    setSelectedPeriod={(period) => setFilters({ period })}
                    startDate={filters.startDate || ""}
                    setStartDate={(date) => setFilters({ startDate: date })}
                    endDate={filters.endDate || ""}
                    setEndDate={(date) => setFilters({ endDate: date })}
                />
            </header>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)] xl:items-start">
                <FinanceHero
                    viewStats={data?.summary || null}
                    byStatus={data?.byStatus || []}
                    isLoading={isLoading}
                    currentPeriod={currentPeriod}
                    selectedClientName={selectedClientName}
                />

                <FinanceActionBar
                    currentPeriod={currentPeriod}
                    isLoading={isLoading}
                    hasData={Boolean(data?.summary?.count)}
                    onExport={handleExportPDF}
                    onExportCSV={() =>
                        data &&
                        exportToCSV(
                            data.summary,
                            data.recentRides,
                            filters.period,
                            data.byStatus,
                        )
                    }
                />
            </section>

            <section className="rounded-[1.75rem] border border-border-subtle bg-card-background p-4 shadow-sm md:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-display font-extrabold tracking-tight text-text-primary">
                            {isClientView ? "Detalhes do cliente" : "Mais detalhes"}
                        </h2>
                        <p className="text-sm font-medium text-text-secondary">
                            {isClientView
                                ? "Abra historico, pagamentos e comportamento sob demanda."
                                : "Abra graficos e indicadores avancados quando precisar."}
                        </p>
                    </div>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowAdvancedDetails((current) => !current)}
                        className="h-11 rounded-2xl border-border-subtle bg-background px-5 font-bold text-text-primary"
                    >
                        {showAdvancedDetails ? (
                            <ChevronUp className="mr-2 size-4" />
                        ) : (
                            <ChevronDown className="mr-2 size-4" />
                        )}
                        {showAdvancedDetails ? "Ocultar detalhes" : "Ver mais"}
                    </Button>
                </div>
            </section>

            {showAdvancedDetails ? (
                <div className="space-y-6">
                    <Tabs
                        value={resolvedActiveTab}
                        onValueChange={(value) => setActiveTab(value as FinanceTab)}
                        className="gap-5"
                    >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-xl font-display font-extrabold tracking-tight text-text-primary md:text-2xl">
                                    {isClientView ? "Perfil financeiro" : "Detalhes"}
                                </h2>
                                <p className="text-sm font-medium text-text-secondary">
                                    {isClientView
                                        ? "Historico e cobranca de um unico cliente."
                                        : "Graficos e listas por contexto."}
                                </p>
                            </div>

                            <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-2xl bg-muted/60 p-1 no-scrollbar md:w-auto">
                                <TabsTrigger className="rounded-xl px-4 py-2 whitespace-nowrap" value="overview">
                                    Resumo
                                </TabsTrigger>
                                {isClientView ? (
                                    <TabsTrigger className="rounded-xl px-4 py-2 whitespace-nowrap" value="history">
                                        Historico
                                    </TabsTrigger>
                                ) : (
                                    <TabsTrigger className="rounded-xl px-4 py-2 whitespace-nowrap" value="clients">
                                        Clientes
                                    </TabsTrigger>
                                )}
                                <TabsTrigger className="rounded-xl px-4 py-2 whitespace-nowrap" value="payments">
                                    Pagamentos
                                </TabsTrigger>
                                {!isClientView ? (
                                    <TabsTrigger className="rounded-xl px-4 py-2 whitespace-nowrap" value="rides">
                                        Corridas
                                    </TabsTrigger>
                                ) : null}
                            </TabsList>
                        </div>

                        {isClientView ? (
                            <>
                                <TabsContent value="overview" className="space-y-6">
                                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
                                        <RevenueTrendChart
                                            data={data?.trends || []}
                                            isLoading={isLoading}
                                            color={PERIODS.find((period) => period.id === filters.period)?.chartColor || "var(--color-primary)"}
                                        />
                                        <SelectedClientSummaryCard
                                            clientName={selectedClientName || "Cliente"}
                                            rides={data?.recentRides || []}
                                        />
                                    </div>

                                    <section className="rounded-[1.75rem] border border-border-subtle bg-card-background px-5 shadow-sm md:px-6">
                                        <Accordion type="single" collapsible defaultValue="recent-activity">
                                            <AccordionItem value="recent-activity" className="border-none">
                                                <AccordionTrigger className="py-5 hover:no-underline">
                                                    <div>
                                                        <h3 className="text-left text-lg font-display font-extrabold text-text-primary">
                                                            Ultimas movimentacoes
                                                        </h3>
                                                        <p className="mt-1 text-left text-sm font-medium text-text-secondary">
                                                            Historico recente de {selectedClientName || "cliente"}.
                                                        </p>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-6">
                                                    <RecentActivity
                                                        rides={data?.recentRides?.slice(0, 5) || []}
                                                        isLoading={isLoading}
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </section>
                                </TabsContent>

                                <TabsContent value="history" className="space-y-6">
                                    <section className="rounded-[2rem] border border-border-subtle bg-card-background p-5 shadow-sm backdrop-blur-xl md:rounded-[3rem] md:p-8">
                                        <div className="mb-6 md:mb-8">
                                            <h2 className="text-xl font-display font-extrabold tracking-tight text-text-primary md:text-2xl">
                                                Historico completo
                                            </h2>
                                            <p className="text-sm font-medium text-text-secondary">
                                                Ultimas corridas do cliente no periodo filtrado.
                                            </p>
                                        </div>
                                        <RecentActivity
                                            rides={data?.recentRides || []}
                                            isLoading={isLoading}
                                        />
                                    </section>
                                </TabsContent>
                            </>
                        ) : (
                            <>
                                <FinanceKpiGrid
                                    viewStats={data?.summary || null}
                                    currentPeriod={currentPeriod}
                                    byStatus={data?.byStatus || []}
                                />

                                <TabsContent value="overview" className="space-y-6">
                                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
                                        <RevenueTrendChart
                                            data={data?.trends || []}
                                            isLoading={isLoading}
                                            color={PERIODS.find((period) => period.id === filters.period)?.chartColor || "var(--color-primary)"}
                                        />
                                        <PaymentSummaryCard data={data?.byStatus || []} />
                                    </div>

                                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
                                        <PaymentStatusBarChart
                                            data={data?.byStatus || []}
                                            isLoading={isLoading}
                                        />
                                        <ClientHighlightsCard data={data?.byClient || []} />
                                    </div>

                                    <section className="rounded-[1.75rem] border border-border-subtle bg-card-background px-5 shadow-sm md:px-6">
                                        <Accordion type="single" collapsible defaultValue="recent-activity">
                                            <AccordionItem value="recent-activity" className="border-none">
                                                <AccordionTrigger className="py-5 hover:no-underline">
                                                    <div>
                                                        <h3 className="text-left text-lg font-display font-extrabold text-text-primary">
                                                            Atividade recente
                                                        </h3>
                                                        <p className="mt-1 text-left text-sm font-medium text-text-secondary">
                                                            Ultimas corridas do periodo.
                                                        </p>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pb-6">
                                                    <RecentActivity
                                                        rides={data?.recentRides?.slice(0, 5) || []}
                                                        isLoading={isLoading}
                                                    />
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </section>
                                </TabsContent>

                                <TabsContent value="clients" className="space-y-6">
                                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
                                        <ClientDistributionChart
                                            data={data?.byClient || []}
                                            isLoading={isLoading}
                                        />
                                        <ClientHighlightsCard data={data?.byClient || []} />
                                    </div>
                                </TabsContent>
                            </>
                        )}

                        <TabsContent value="payments" className="space-y-6">
                            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.95fr)]">
                                <PaymentStatusBarChart
                                    data={data?.byStatus || []}
                                    isLoading={isLoading}
                                />
                                <PaymentSummaryCard data={data?.byStatus || []} />
                            </div>
                        </TabsContent>

                        {!isClientView ? (
                            <TabsContent value="rides" className="space-y-6">
                                <section className="rounded-[2rem] border border-border-subtle bg-card-background p-5 shadow-sm backdrop-blur-xl md:rounded-[3rem] md:p-8">
                                    <div className="mb-6 md:mb-8">
                                        <h2 className="text-xl font-display font-extrabold tracking-tight text-text-primary md:text-2xl">
                                            Atividade Recente
                                        </h2>
                                        <p className="text-sm font-medium text-text-secondary">
                                            Ultimas 10 corridas
                                        </p>
                                    </div>
                                    <RecentActivity
                                        rides={data?.recentRides || []}
                                        isLoading={isLoading}
                                    />
                                </section>
                            </TabsContent>
                        ) : null}
                    </Tabs>
                </div>
            ) : null}

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
