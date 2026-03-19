"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Client, RidesFilterState } from "../types";

interface RidesFiltersProps {
    filters: RidesFilterState;
    setSearch: (s: string) => void;
    setStatusFilter: (s: string) => void;
    setPaymentFilter: (p: string) => void;
    setClientFilter: (c: string) => void;
    setStartDate: (d: string) => void;
    setEndDate: (d: string) => void;
    isFiltersOpen: boolean;
    setIsFiltersOpen: (o: boolean) => void;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    clients: Client[];
}

export function RidesFilters({
    filters,
    setSearch,
    setStatusFilter,
    setPaymentFilter,
    setClientFilter,
    setStartDate,
    setEndDate,
    isFiltersOpen,
    setIsFiltersOpen,
    hasActiveFilters,
    onClearFilters,
    clients
}: RidesFiltersProps) {
    const { search, statusFilter, paymentFilter, clientFilter, startDate, endDate } = filters;

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 pt-4">
                <div className="relative group flex-1">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-blue-400 transition-colors text-slate-500">
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por cliente ou ID da corrida..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                    />
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                        className={cn(
                            "flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border",
                            isFiltersOpen ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900/50 border-white/5 text-slate-400 hover:bg-slate-900 hover:border-white/10"
                        )}
                    >
                        <Filter size={20} />
                        {isFiltersOpen ? "Fechar Filtros" : "Filtros"}
                    </button>
                    {hasActiveFilters && (
                        <button
                            onClick={onClearFilters}
                            className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-900/30 border border-white/5 rounded-[2rem]">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Status da Corrida</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="all">Todos os Status</option>
                                    <option value="COMPLETED">Concluída</option>
                                    <option value="PENDING">Pendente</option>
                                    <option value="CANCELLED">Cancelada</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pagamento</label>
                                <select
                                    value={paymentFilter}
                                    onChange={(e) => setPaymentFilter(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="all">Todos os Pagamentos</option>
                                    <option value="PAID">Pago</option>
                                    <option value="PENDING">Não Pago</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cliente</label>
                                <select
                                    value={clientFilter}
                                    onChange={(e) => setClientFilter(e.target.value)}
                                    className="w-full bg-slate-950 border border-white/10 rounded-xl py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="all">Todos os Clientes</option>
                                    {clients.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Período (Início - Fim)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
                                    />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:border-blue-500/50 [color-scheme:dark]"
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
