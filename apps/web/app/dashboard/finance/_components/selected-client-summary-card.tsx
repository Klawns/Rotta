import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin } from 'lucide-react';
import { RidePaymentAction } from '@/components/ui/ride-payment-action';
import { formatCurrency } from '@/lib/utils';
import type { RecentRide } from '@/services/finance-service';
import { getLatestRide, getTopLocation } from '../_lib/finance-metrics';

interface SelectedClientSummaryCardProps {
  clientName: string;
  rides: RecentRide[];
  onChangePaymentStatus?: (
    ride: RecentRide,
    status: 'PAID' | 'PENDING',
  ) => void | Promise<unknown>;
  isPaymentUpdating?: (rideId: string) => boolean;
}

function formatRideDate(value?: string) {
  if (!value) {
    return 'Data indisponivel';
  }

  const parsedDate = parseISO(value);

  if (!isValid(parsedDate)) {
    return 'Data indisponivel';
  }

  return format(parsedDate, "dd 'de' MMM", { locale: ptBR });
}

export function SelectedClientSummaryCard({
  clientName,
  rides,
  onChangePaymentStatus,
  isPaymentUpdating,
}: SelectedClientSummaryCardProps) {
  const latestRide = getLatestRide(rides);
  const topLocation = getTopLocation(rides);

  return (
    <section className="rounded-[3rem] border border-border bg-card/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-foreground">
          Historico do cliente
        </h3>
        <p className="text-xs font-medium text-muted-foreground">
          Contexto rapido para {clientName.toLowerCase()} neste recorte.
        </p>
      </div>

      {!rides.length ? (
        <div className="rounded-[1.75rem] border border-dashed border-border-subtle bg-muted/20 py-10 text-center text-sm font-medium text-text-muted">
          Nenhuma corrida recente encontrada para este cliente.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-border-subtle bg-background/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Ultima corrida
            </p>
            <div className="mt-3 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-display font-extrabold text-text-primary">
                  {formatCurrency(latestRide?.value || 0)}
                </p>
                <p className="text-sm text-text-secondary">
                  {formatRideDate(latestRide?.rideDate)}
                </p>
              </div>
              {latestRide ? (
                <RidePaymentAction
                  paymentStatus={latestRide.paymentStatus}
                  onChangeStatus={
                    onChangePaymentStatus
                      ? (status) => onChangePaymentStatus(latestRide, status)
                      : undefined
                  }
                  isLoading={isPaymentUpdating?.(latestRide.id)}
                  size="xs"
                />
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border-subtle bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                Historico recente
              </p>
              <p className="mt-2 text-2xl font-display font-extrabold text-text-primary">
                {rides.length}
              </p>
              <p className="text-sm text-text-secondary">
                corridas carregadas neste recorte
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-border-subtle bg-background/70 p-4">
              <div className="flex items-center gap-2 text-text-muted">
                <MapPin className="size-4" />
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">
                  Local recorrente
                </p>
              </div>
              <p className="mt-2 text-lg font-display font-extrabold text-text-primary">
                {topLocation || 'Nao informado'}
              </p>
              <p className="text-sm text-text-secondary">
                baseado nas ultimas movimentacoes
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
