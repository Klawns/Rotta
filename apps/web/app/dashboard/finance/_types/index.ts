export interface FinanceClient {
    id: string;
    name: string;
}

export interface FinanceRide {
    id: string;
    clientId: string;
    value: number;
    notes?: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID';
    rideDate?: string;
    createdAt: string;
    location?: string;
    client?: {
        name: string;
    };
}

export interface FinanceStats {
    count: number;
    totalValue: number;
    rides: FinanceRide[];
}

export interface Period {
    id: PeriodId;
    label: string;
    color: string;
    text: string;
    border: string;
}

export type PeriodId = 'today' | 'week' | 'month' | 'custom';

export interface ExportState {
    period: PeriodId;
    stats: FinanceStats;
}

export const PERIODS: readonly Period[] = [
    { id: 'today', label: 'Hoje', color: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/20' },
    { id: 'week', label: 'Semana', color: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    { id: 'month', label: 'Mês', color: 'bg-indigo-500', text: 'text-indigo-400', border: 'border-indigo-500/20' },
    { id: 'custom', label: 'Personalizado', color: 'bg-amber-500', text: 'text-amber-400', border: 'border-amber-500/20' },
] as const;
