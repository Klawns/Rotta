import { formatCurrency } from '@/lib/utils';
import type { FinanceByClient } from '@/services/finance-service';
import { getSortedClients } from '../_lib/finance-metrics';

interface ClientHighlightsCardProps {
  data: FinanceByClient[];
}

export function ClientHighlightsCard({ data }: ClientHighlightsCardProps) {
  const sortedClients = getSortedClients(data);
  const totalValue = sortedClients.reduce(
    (total, item) => total + Number(item.value || 0),
    0,
  );
  const topClient = sortedClients[0] ?? null;

  return (
    <section className="rounded-[3rem] border border-border bg-card/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-foreground">
          Clientes em destaque
        </h3>
        <p className="text-xs font-medium text-muted-foreground">
          Ranking rápido para complementar a distribuição por cliente.
        </p>
      </div>

      {!sortedClients.length ? (
        <div className="rounded-[1.75rem] border border-dashed border-border-subtle bg-muted/20 py-10 text-center text-sm font-medium text-text-muted">
          Nenhum cliente com receita neste período.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-border-subtle bg-background/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Líder de receita
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-display font-extrabold text-text-primary">
                  {topClient?.clientName || 'Cliente'}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {formatCurrency(topClient?.value || 0)} no período
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {totalValue && topClient
                  ? ((topClient.value / totalValue) * 100).toFixed(0)
                  : '0'}
                %
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {sortedClients.slice(0, 5).map((client) => {
              const share = totalValue ? (client.value / totalValue) * 100 : 0;

              return (
                <div
                  key={client.clientId || client.clientName}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {client.clientName || 'Cliente'}
                    </p>
                    <p className="text-sm font-bold text-text-secondary">
                      {formatCurrency(client.value)}
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary transition-all"
                      style={{ width: `${Math.max(share, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
