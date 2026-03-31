import { formatCurrency } from '@/lib/utils';
import type { FinanceByStatus } from '@/services/finance-service';
import { getFinanceStatusTotals } from '../_lib/finance-metrics';

interface PaymentSummaryCardProps {
  data: FinanceByStatus[];
}

export function PaymentSummaryCard({ data }: PaymentSummaryCardProps) {
  const { paidValue, pendingValue, collectionRate } =
    getFinanceStatusTotals(data);

  return (
    <section className="rounded-[3rem] border border-border bg-card/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-foreground">
          Saude dos recebimentos
        </h3>
        <p className="text-xs font-medium text-muted-foreground">
          Percentual recebido e saldo que ainda depende de pagamento.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-border-subtle bg-background/80 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          Taxa de recebimento
        </p>
        <div className="mt-3 flex items-end justify-between gap-4">
          <p className="text-4xl font-display font-extrabold text-text-primary">
            {collectionRate.toFixed(0)}%
          </p>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-bold text-emerald-400">
            {formatCurrency(paidValue)} recebido
          </span>
        </div>
        <div className="mt-4 h-2 rounded-full bg-muted">
          <div
            className="h-2 rounded-full bg-emerald-500 transition-all"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] border border-emerald-500/20 bg-emerald-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">
            Pago
          </p>
          <p className="mt-2 text-2xl font-display font-extrabold text-text-primary">
            {formatCurrency(paidValue)}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-400">
            Pendente
          </p>
          <p className="mt-2 text-2xl font-display font-extrabold text-text-primary">
            {formatCurrency(pendingValue)}
          </p>
        </div>
      </div>
    </section>
  );
}
