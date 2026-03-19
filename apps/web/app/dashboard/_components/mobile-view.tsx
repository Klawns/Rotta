"use client";

import { User } from "@/hooks/use-auth";
import { MobileDashboard } from "@/components/dashboard/mobile-dashboard";
import { formatCurrency } from "@/lib/format";
import { Ride } from "../rides/types";

interface DashboardMobileViewProps {
    user: User | null;
    period: string;
    stats: {
        count: number;
        totalValue: number;
        rides: Ride[];
    };
    onRideCreated: () => void;
}

/**
 * Visão otimizada para dispositivos móveis da página de Dashboard.
 */
export function DashboardMobileView({ user, period, stats, onRideCreated }: DashboardMobileViewProps) {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-white tracking-tight">Painel Rápido</h1>
                <p className="text-slate-400 text-sm">Olá, {user?.name?.split(" ")[0]}! Registre suas corridas aqui.</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Corridas {period === 'today' ? 'Hoje' : 'na Semana'}</p>
                    <h3 className="text-lg font-bold text-white mt-1">{stats.count}</h3>
                </div>
                <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl">
                    <p className="text-slate-400 text-[10px] font-bold uppercase">Faturamento</p>
                    <h3 className="text-lg font-bold text-white mt-1">
                        {formatCurrency(stats.totalValue)}
                    </h3>
                </div>
            </div>

            <MobileDashboard onRideCreated={onRideCreated} />
        </div>
    );
}
