"use client";

import { cn, formatCurrency } from "@/lib/utils";

interface FinanceSummaryProps {
    today: number;
    week: number;
    month: number;
}

export function FinanceSummary({ today, week, month }: FinanceSummaryProps) {
    const stats = [
        { label: "Hoje", val: today, color: "text-blue-400" },
        { label: "Semana", val: week, color: "text-emerald-400" },
        { label: "Mês", val: month, color: "text-violet-400" },
    ];

    return (
        <section className="grid grid-cols-3 gap-2">
            {stats.map(s => (
                <div key={s.label} className="bg-slate-900/60 border border-white/5 rounded-2xl p-3 text-center">
                    <p className="text-[9px] uppercase font-black text-slate-500 tracking-tighter mb-1">{s.label}</p>
                    <p className={cn("text-xs font-bold truncate", s.color)}>{formatCurrency(s.val)}</p>
                </div>
            ))}
        </section>
    );
}
