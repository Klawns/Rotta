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
import { type Client } from "@/types/rides";
import { PERIODS, PeriodId } from "../_types";

interface FinanceFiltersProps {
    clients: Client[];
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
        <div className="sticky top-3 z-20 flex flex-col items-stretch gap-3 rounded-[1.5rem] border border-border-subtle bg-background/85 p-2.5 shadow-lg backdrop-blur-xl md:flex-row md:items-center md:rounded-[2rem] md:p-3">
            <div className="flex w-full overflow-x-auto rounded-2xl border border-border-subtle bg-card-background p-1 shadow-inner md:w-auto no-scrollbar">
                {PERIODS.map((p) => (
                    <button
                        key={p.id}
                        onClick={() => setSelectedPeriod(p.id as PeriodId)}
                        className={cn(
                            "rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] transition-all whitespace-nowrap",
                            selectedPeriod === p.id
                                ? `${p.color} text-white shadow-lg`
                                : "text-text-muted hover:text-text-primary hover:bg-hover-accent"
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="mx-2 hidden h-8 w-px bg-border-subtle md:block" />

            <div className="w-full md:w-64">
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                    <SelectTrigger className="h-11 rounded-xl border border-border-subtle bg-card-background pl-4 text-text-primary font-bold shadow-sm transition-all outline-none ring-0 hover:bg-hover-accent md:h-12">
                        <div className="flex items-center gap-3">
                            <UserIcon size={16} className="text-primary" />
                            <SelectValue placeholder="Cliente" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="bg-card-background border border-border-subtle text-text-primary rounded-xl shadow-xl">
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
                        className="grid w-full gap-3 sm:grid-cols-2 md:flex md:w-auto"
                    >
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="h-11 w-full rounded-xl border-border-subtle bg-card-background text-text-primary font-bold shadow-sm md:h-12 md:w-40"
                        />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="h-11 w-full rounded-xl border-border-subtle bg-card-background text-text-primary font-bold shadow-sm md:h-12 md:w-40"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
