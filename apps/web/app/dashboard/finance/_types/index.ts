export type PeriodId = 'today' | 'week' | 'month' | 'year' | 'custom';

export interface Period {
  id: PeriodId;
  label: string;
  color: string;
  text: string;
  border: string;
  chartColor: string;
}

export type FinanceDashboardTab =
  | 'overview'
  | 'clients'
  | 'payments'
  | 'rides'
  | 'history';

export const PERIODS: readonly Period[] = [
  {
    id: 'today',
    label: 'Hoje',
    color: 'bg-primary',
    text: 'text-primary',
    border: 'border-primary/20',
    chartColor: 'var(--color-primary)',
  },
  {
    id: 'week',
    label: 'Semana',
    color: 'bg-emerald-500',
    text: 'text-emerald-400',
    border: 'border-emerald-500/20',
    chartColor: 'var(--color-chart-2)',
  },
  {
    id: 'month',
    label: 'Mes',
    color: 'bg-violet-500',
    text: 'text-violet-400',
    border: 'border-violet-500/20',
    chartColor: 'var(--color-chart-3)',
  },
  {
    id: 'year',
    label: 'Ano',
    color: 'bg-amber-500',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
    chartColor: 'var(--color-chart-4)',
  },
  {
    id: 'custom',
    label: 'Personalizado',
    color: 'bg-sky-500',
    text: 'text-sky-400',
    border: 'border-sky-500/20',
    chartColor: 'var(--color-chart-5)',
  },
] as const;
