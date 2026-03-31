import { Wallet } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import type {
  FinanceByStatus,
  FinanceSummary,
} from '@/services/finance-service';
import { getFinanceStatusTotals } from '../_lib/finance-metrics';
import { getPeriodAccent } from '../_lib/finance-theme';
import type { Period } from '../_types';

interface FinanceHeroProps {
  currentPeriod: Period;
  summary: FinanceSummary | null;
  byStatus: FinanceByStatus[];
  isLoading: boolean;
  selectedClientName?: string | null;
}

export function FinanceHero({
  currentPeriod,
  summary,
  byStatus,
  isLoading,
  selectedClientName,
}: FinanceHeroProps) {
  const accent = getPeriodAccent(currentPeriod.id);
  const { pendingValue } = getFinanceStatusTotals(byStatus);
  const isClientView = Boolean(selectedClientName);
  const summaryItems = [
    {
      label: 'Corridas',
      value: String(summary?.count || 0),
      helper: 'No periodo',
    },
    {
      label: 'Media',
      value: formatCurrency(summary?.ticketMedio || 0),
      helper: 'Por corrida',
    },
    {
      label: 'Pendente',
      value: formatCurrency(pendingValue),
      helper: 'A receber',
    },
  ];

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-[2rem] border bg-card-background p-6 shadow-sm md:rounded-[2.5rem] md:p-8',
        accent.border,
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100',
          accent.glow,
        )}
      />

      <div className="relative flex h-full flex-col gap-6">
        <div className="space-y-3">
          <span
            className={cn(
              'inline-flex max-w-full items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.28em]',
              accent.badge,
            )}
          >
            <Wallet className="size-4" />
            <span className="truncate">
              {isClientView && selectedClientName
                ? `Cliente selecionado: ${selectedClientName}`
                : `Resumo ${currentPeriod.label}`}
            </span>
          </span>

          <div className="space-y-2">
            <h2
              className={cn(
                'font-display text-5xl font-extrabold tracking-tight text-text-primary md:text-6xl',
                isLoading && 'opacity-40 blur-[1px]',
              )}
            >
              {formatCurrency(summary?.totalValue || 0)}
            </h2>
            <p className="text-sm font-medium text-text-secondary">
              {isClientView
                ? 'Total do cliente no periodo selecionado'
                : 'Total no periodo selecionado'}
            </p>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-border-subtle bg-background/80 p-4 md:p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {summaryItems.map((item, index) => (
              <div
                key={item.label}
                className={cn(
                  'space-y-1 sm:pr-4',
                  index < summaryItems.length - 1 &&
                    'sm:border-r sm:border-border-subtle',
                )}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-text-muted">
                  {item.label}
                </p>
                <p className="text-xl font-display font-extrabold text-text-primary md:text-2xl">
                  {item.value}
                </p>
                <p className="text-sm text-text-secondary">{item.helper}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
