"use client";

import { motion } from "framer-motion";
import { Bike, Wallet } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";

interface DashboardStatsGridProps {
    count: number;
    totalValue: number;
    period: 'today' | 'week';
    isLoading: boolean;
}

export function DashboardStatsGrid({ count, totalValue, period, isLoading }: DashboardStatsGridProps) {
    const stats = [
        {
            label: `Corridas ${period === 'today' ? 'Hoje' : 'na Semana'}`,
            value: String(count),
            icon: Bike,
            bg: period === 'today' ? "bg-blue-600/20" : "bg-orange-500/30",
            text: period === 'today' ? "text-blue-400" : "text-orange-400"
        },
        {
            label: "Faturamento",
            value: formatCurrency(totalValue),
            icon: Wallet,
            bg: "bg-violet-600/20",
            text: "text-violet-400"
        },
    ];

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => <div key={i} className="h-40 bg-white/5 animate-pulse rounded-3xl" />)}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/40 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-colors"></div>
                    <div className="flex items-start justify-between relative z-10">
                        <div className={cn("p-4 rounded-2xl", stat.bg)}>
                            <stat.icon size={24} className={stat.text} />
                        </div>
                    </div>
                    <div className="mt-6 relative z-10">
                        <p className="text-slate-400 text-sm font-medium">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-white mt-1">{stat.value}</h3>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
