"use client";

import { motion, AnimatePresence } from "framer-motion";
import { parseApiError } from "@/lib/api-error";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ClientDirectoryMeta } from "@/services/clients-service";
import { ClientDirectoryEntry, RidesFilterState } from "@/types/rides";

interface RidesFiltersProps {
    filters: RidesFilterState;
    setSearch: (s: string) => void;
    setPaymentFilter: (p: string) => void;
    setClientFilter: (c: string) => void;
    setStartDate: (d: string) => void;
    setEndDate: (d: string) => void;
    isFiltersOpen: boolean;
    setIsFiltersOpen: (o: boolean) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    clients: ClientDirectoryEntry[];
    clientSearch: string;
    setClientSearch: (search: string) => void;
    isLoadingClients?: boolean;
    isFetchingClients?: boolean;
    isClientDirectoryError?: boolean;
    clientDirectoryError?: unknown;
    onRetryClients?: () => void;
    isClientDirectoryReady?: boolean;
    clientDirectoryMeta?: ClientDirectoryMeta | null;
}

export function RidesFilters({
    filters,
    setSearch,
    setPaymentFilter,
    setClientFilter,
    setStartDate,
    setEndDate,
    isFiltersOpen,
    setIsFiltersOpen,
    hasActiveFilters,
    onClearFilters,
    clients,
    clientSearch,
    setClientSearch,
    isLoadingClients = false,
    isFetchingClients = false,
    isClientDirectoryError = false,
    clientDirectoryError,
    onRetryClients,
    isClientDirectoryReady = false,
    clientDirectoryMeta = null,
}: RidesFiltersProps) {
    const { search, paymentFilter, clientFilter, startDate, endDate } = filters;
    const isClientSelectDisabled =
        isLoadingClients || (!isClientDirectoryReady && isClientDirectoryError);

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 pt-4">
                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-primary transition-colors text-text-muted opacity-50">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou ID da corrida..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-muted/50 border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-semibold shadow-inner"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all border shadow-sm",
                            isFiltersOpen 
                                ? "bg-button-primary border-button-primary text-button-primary-foreground shadow-button-shadow" 
                                : "bg-muted/50 border-border-subtle text-text-secondary hover:bg-hover-accent hover:border-border"
                        )}
                    >
                        <Filter size={18} />
                        {isFiltersOpen ? "Fechar" : "Filtros"}
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="p-4 bg-button-destructive-subtle border border-border-destructive/10 text-icon-destructive rounded-2xl hover:bg-button-destructive hover:text-white transition-all shadow-sm active:scale-95"
                            title="Limpar Filtros"
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {isFiltersOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 bg-muted/30 border border-border-subtle rounded-[2.5rem] shadow-inner mb-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-70">Pagamento</label>
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    className="w-full bg-card-background border border-border-subtle rounded-xl py-3 px-4 text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                                >
                                    <option value="all">Todos os Pagamentos</option>
                                    <option value="PAID">Pago</option>
                                    <option value="PENDING">Pendente</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-70">Cliente</label>
                                <input
                                    type="text"
                                    value={clientSearch}
                                    onChange={(event) => setClientSearch(event.target.value)}
                                    placeholder="Buscar cliente por nome"
                                    className="w-full bg-card-background border border-border-subtle rounded-xl py-3 px-4 text-xs font-medium text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                />
                                <select
                                    value={clientFilter}
                                    onChange={(e) => setClientFilter(e.target.value)}
                                    disabled={isClientSelectDisabled}
                                    className="w-full bg-card-background border border-border-subtle rounded-xl py-3 px-4 text-xs font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
                                >
                                    <option value="all">Todos os Clientes</option>
                                    {isLoadingClients ? (
                                        <option value="loading" disabled>Carregando clientes...</option>
                                    ) : null}
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                                {isLoadingClients ? (
                                    <p className="text-xs font-medium text-text-secondary">
                                        Carregando clientes...
                                    </p>
                                ) : null}
                                {!isLoadingClients && isFetchingClients && isClientDirectoryReady ? (
                                    <p className="text-xs font-medium text-text-secondary">
                                        Atualizando clientes...
                                    </p>
                                ) : null}
                                {isClientDirectoryError ? (
                                    <div className="rounded-xl border border-border-destructive/20 bg-button-destructive-subtle px-3 py-2 text-xs text-icon-destructive">
                                        <p>{parseApiError(clientDirectoryError, 'Nao foi possivel carregar os clientes.')}</p>
                                        <button
                                            type="button"
                                            onClick={onRetryClients}
                                            className="mt-1 font-bold uppercase tracking-widest underline underline-offset-4"
                                        >
                                            Tentar novamente
                                        </button>
                                    </div>
                                ) : null}
                                {!isLoadingClients && !isClientDirectoryError && isClientDirectoryReady && clients.length === 0 ? (
                                    <p className="text-xs font-medium text-text-secondary">
                                        {clientSearch.trim()
                                            ? "Nenhum cliente encontrado para a busca informada."
                                            : "Nenhum cliente cadastrado."}
                                    </p>
                                ) : null}
                                {!isLoadingClients && !isClientDirectoryError && isClientDirectoryReady && clientDirectoryMeta?.hasMore && !clientSearch.trim() ? (
                                    <p className="text-xs font-medium text-text-secondary">
                                        Mostrando {clientDirectoryMeta.returned} clientes. Digite para refinar.
                                    </p>
                                ) : null}
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1 opacity-70">Período (Início - Fim)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="flex-1 bg-card-background border border-border-subtle rounded-xl py-3 px-3 text-[10px] font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="flex-1 bg-card-background border border-border-subtle rounded-xl py-3 px-3 text-[10px] font-bold text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
