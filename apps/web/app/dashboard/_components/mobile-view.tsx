"use client";

import MobileDashboard from "@/components/dashboard/mobile-dashboard";
import { formatCurrency } from "@/lib/format";
import { type DashboardMobileStats } from "../_hooks/use-dashboard";
import { FeatureLockShell } from "./feature-lock-shell";
import { TrialStatusCard } from "./trial-status-card";
import type { FreeTrialState } from "@/services/free-trial-service";

interface DashboardMobileViewProps {
    stats: DashboardMobileStats;
    onRideCreated: () => void;
    trial: FreeTrialState;
}

export function DashboardMobileView({
    stats,
    onRideCreated,
    trial,
}: DashboardMobileViewProps) {
    return (
        <div className="mx-auto flex w-full max-w-md flex-col gap-5 pt-1">
            <TrialStatusCard trial={trial} />

            <FeatureLockShell
                isLocked={trial.shouldLockFeatures}
                title="Dashboard bloqueado"
                description="As principais funcoes continuam visiveis no mobile, mas exigem assinatura para voltar a operar."
                ctaHref={trial.ctaHref}
                ctaLabel={trial.ctaLabel}
            >
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card-background border border-border-subtle p-4 rounded-2xl shadow-sm">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase">Corridas {stats.period === 'today' ? 'Hoje' : 'na Semana'}</p>
                        <h3 className="text-lg font-bold text-text-primary mt-1">{stats.isPending ? '--' : (stats.count ?? '--')}</h3>
                    </div>
                    <div className="bg-card-background border border-border-subtle p-4 rounded-2xl shadow-sm">
                        <p className="text-muted-foreground text-[10px] font-bold uppercase">Faturamento</p>
                        <h3 className="text-lg font-bold text-text-primary mt-1">
                            {stats.isPending || typeof stats.totalValue !== 'number'
                                ? '--'
                                : formatCurrency(stats.totalValue)}
                        </h3>
                    </div>
                </div>
            </FeatureLockShell>

            <MobileDashboard onRideCreated={onRideCreated} trial={trial} />
        </div>
    );
}
