"use client";

import { motion } from "framer-motion";
import { Wallet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { FinanceStats, Period } from "../_types";

interface StatsCardProps {
    viewStats: FinanceStats | null;
    isLoading: boolean;
    currentPeriod: Period;
    onExport: () => void;
}

export function StatsCard({
    viewStats,
    isLoading,
    currentPeriod,
    onExport,
}: StatsCardProps) {
    return (
        <div className="grid grid-cols-1">
            <motion.div
                layoutId="stats-card"
                className={cn(
                    "p-1 rounded-[3rem] bg-gradient-to-br transition-all duration-500",
                    currentPeriod.id === 'today' ? "from-blue-500/20 to-transparent" :
                        currentPeriod.id === 'week' ? "from-emerald-500/20 to-transparent" :
                            currentPeriod.id === 'month' ? "from-indigo-500/20 to-transparent" :
                                "from-amber-500/20 to-transparent"
                )}
            >
                <div className="bg-[#0f172a] rounded-[2.8rem] p-10 md:p-14 border border-white/5 relative overflow-hidden">
                    {/* Indicador Lateral de Cor */}
                    <div className={cn("absolute top-0 left-0 w-2 h-full", currentPeriod.color)} />

                    <div className="flex flex-col items-center text-center">
                        <div className={cn("p-6 rounded-3xl mb-8 shadow-2xl transition-colors duration-500", currentPeriod.color + "/20", currentPeriod.text)}>
                            <Wallet size={48} />
                        </div>

                        <span className={cn("text-xs font-black uppercase tracking-[.3em] mb-4", currentPeriod.text)}>
                            Resumo {currentPeriod.label}
                        </span>

                        <div className={cn(
                            "transition-all duration-700 w-full flex flex-col items-center",
                            isLoading ? "opacity-30 blur-md scale-95" : "opacity-100 blur-0 scale-100"
                        )}>
                            <h3 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-4">
                                {formatCurrency(viewStats?.totalValue || 0)}
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <p className="text-slate-400 text-lg font-bold">
                                    {viewStats?.count || 0} corridas realizadas
                                </p>
                            </div>

                            <div className="w-full mt-12 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-center gap-6">
                                <Button
                                    onClick={onExport}
                                    disabled={isLoading || !viewStats?.count}
                                    className={cn(
                                        "w-full md:w-auto px-10 h-16 rounded-2xl text-white font-black flex items-center gap-4 shadow-xl transition-all active:scale-95",
                                        currentPeriod.color,
                                        "hover:opacity-90",
                                        (isLoading || !viewStats?.count) && "grayscale opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <Download size={24} />
                                    EXPORTAR PDF {currentPeriod.label.toUpperCase()}
                                </Button>
                            </div>
                        </div>

                        {/* Loading Overlay Sutil */}
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-transparent z-50">
                                <div className={cn(
                                    "h-16 w-16 border-4 border-t-transparent rounded-full animate-spin",
                                    currentPeriod.border,
                                    "border-t-" + currentPeriod.color.replace('bg-', '')
                                )} />
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
