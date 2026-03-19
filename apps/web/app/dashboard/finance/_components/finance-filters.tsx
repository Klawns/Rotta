"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { PERIODS, PeriodId, FinanceClient } from "../_types";

interface FinanceFiltersProps {
    clients: FinanceClient[];
    selectedClientId: string;
    setSelectedClientId: (id: string) => void;
    selectedPeriod: PeriodId;
    setSelectedPeriod: (period: PeriodId) => void;
    startDate: string;
    setStartDate: (date: string) => void;
    endDate: string;
    setEndDate: (date: string) => void;
}

export function FinanceFilters({
    clients,
    selectedClientId,
    setSelectedClientId,
    selectedPeriod,
    setSelectedPeriod,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}: FinanceFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-slate-900/40 p-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
            <div className="flex bg-slate-950/50 p-1.5 rounded-2xl border border-white/5 w-full md:w-auto overflow-x-auto no-scrollbar">
                {PERIODS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedPeriod(p.id as PeriodId)}
                        className={cn(
                            "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            selectedPeriod === p.id
                                ? `${p.color} text-white shadow-lg`
                                : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="hidden md:block w-px h-8 bg-white/10 mx-2" />

            <div className="w-full md:w-64">
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="h-12 bg-slate-950/50 border-white/5 rounded-xl pl-4 text-white font-bold hover:bg-white/5 transition-all outline-none ring-0 border">
                        <div className="flex items-center gap-3">
                            <UserIcon size={16} className="text-blue-400" />
                            <SelectValue placeholder="Cliente" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                        <SelectItem value="all">Todos os Clientes</SelectItem>
                        {clients.map(client => (
                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <AnimatePresence>
                {selectedPeriod === 'custom' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-3 w-full md:w-auto"
                    >
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-12 bg-slate-950/50 border-white/5 rounded-xl text-white font-bold w-full md:w-40"
                        />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-12 bg-slate-950/50 border-white/5 rounded-xl text-white font-bold w-full md:w-40"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
