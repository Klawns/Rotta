"use client";

import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
    userName: string;
    period: 'today' | 'week';
    setPeriod: (period: 'today' | 'week') => void;
}

export function DashboardHeader({ userName, period, setPeriod }: DashboardHeaderProps) {
    const firstName = userName?.split(" ")[0] || "Usuário";

    return (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Olá, {firstName}!</h1>
                <p className="text-slate-400 mt-1">Aqui está o resumo das suas atividades.</p>
            </div>
            <div className="flex items-center gap-3 bg-slate-900/50 p-1 rounded-xl border border-white/5 self-start md:self-center">
                <button
                    onClick={() => setPeriod('today')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all", 
                        period === 'today' 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                            : "text-slate-400 hover:text-white"
                    )}
                >
                    Hoje
                </button>
                <button
                    onClick={() => setPeriod('week')}
                    className={cn(
                        "px-4 py-2 rounded-lg text-sm font-medium transition-all", 
                        period === 'week' 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                            : "text-slate-400 hover:text-white"
                    )}
                >
                    Semana
                </button>
            </div>
        </header>
    );
}
