'use client';

import {
  CarFront,
  Clock3,
  Download,
  FileSpreadsheet,
  MapPin,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency } from '@/lib/utils';
import {
  FinanceByClient,
  FinanceByStatus,
  RecentRide,
} from '@/services/finance-service';
import { FinanceStats, Period, PeriodId } from '../_types';

interface FinanceHeroProps {
  currentPeriod: Period;
  viewStats: FinanceStats | null;
  byStatus: FinanceByStatus[];
  isLoading: boolean;
  selectedClientName?: string | null;
}

interface FinanceKpiGridProps {
  currentPeriod: Period;
  viewStats: FinanceStats | null;
  byStatus: FinanceByStatus[];
}

interface FinanceActionBarProps {
  currentPeriod: Period;
  isLoading: boolean;
  hasData: boolean;
  onExport: () => void;
  onExportCSV: () => void;
}

interface ClientHighlightsCardProps {
  data: FinanceByClient[];
}

interface PaymentSummaryCardProps {
  data: FinanceByStatus[];
}

interface SelectedClientSummaryCardProps {
  clientName: string;
  rides: RecentRide[];
}

const periodAccentClasses: Record<
  PeriodId,
  {
    badge: string;
    border: string;
    surface: string;
    glow: string;
    text: string;
  }
> = {
  today: {
    badge: 'bg-primary text-white',
    border: 'border-primary/20',
    surface: 'bg-primary/10',
    glow: 'from-primary/16 via-primary/6 to-transparent',
    text: 'text-primary',
  },
  week: {
    badge: 'bg-emerald-500 text-white',
    border: 'border-emerald-500/20',
    surface: 'bg-emerald-500/10',
    glow: 'from-emerald-500/16 via-emerald-500/6 to-transparent',
    text: 'text-emerald-400',
  },
  month: {
    badge: 'bg-violet-500 text-white',
    border: 'border-violet-500/20',
    surface: 'bg-violet-500/10',
    glow: 'from-violet-500/16 via-violet-500/6 to-transparent',
    text: 'text-violet-400',
  },
  year: {
    badge: 'bg-amber-500 text-slate-950',
    border: 'border-amber-500/20',
    surface: 'bg-amber-500/10',
    glow: 'from-amber-500/16 via-amber-500/6 to-transparent',
    text: 'text-amber-400',
  },
  custom: {
    badge: 'bg-sky-500 text-white',
    border: 'border-sky-500/20',
    surface: 'bg-sky-500/10',
    glow: 'from-sky-500/16 via-sky-500/6 to-transparent',
    text: 'text-sky-400',
  },
};

function sumStatusValue(data: FinanceByStatus[], status: FinanceByStatus['status']) {
  return data
    .filter((item) => item.status === status)
    .reduce((total, item) => total + Number(item.value || 0), 0);
}

function getCollectionRate(data: FinanceByStatus[]) {
  const paidValue = sumStatusValue(data, 'PAID');
  const pendingValue = sumStatusValue(data, 'PENDING');
  const total = paidValue + pendingValue;

  if (!total) {
    return 0;
  }

  return (paidValue / total) * 100;
}

function sortClients(data: FinanceByClient[]) {
  return [...data].sort((left, right) => right.value - left.value);
}

function getLatestRide(rides: RecentRide[]) {
  return [...rides].sort((left, right) => {
    const leftTime = Date.parse(left.rideDate || '');
    const rightTime = Date.parse(right.rideDate || '');

    return rightTime - leftTime;
  })[0] ?? null;
}

function getTopLocation(rides: RecentRide[]) {
  const counts = rides.reduce<Record<string, number>>((accumulator, ride) => {
    if (!ride.location) {
      return accumulator;
    }

    accumulator[ride.location] = (accumulator[ride.location] || 0) + 1;

    return accumulator;
  }, {});

  return (
    Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ||
    null
  );
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

export function FinanceHero({
  currentPeriod,
  viewStats,
  byStatus,
  isLoading,
  selectedClientName,
}: FinanceHeroProps) {
  const accent = periodAccentClasses[currentPeriod.id];
  const pendingValue = sumStatusValue(byStatus, 'PENDING');
  const isClientView = Boolean(selectedClientName);
  const summaryItems = [
    {
      label: 'Corridas',
      value: String(viewStats?.count || 0),
      helper: 'No periodo',
    },
    {
      label: 'Media',
      value: formatCurrency(viewStats?.ticketMedio || 0),
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
        <div className="flex flex-col gap-5">
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
                {formatCurrency(viewStats?.totalValue || 0)}
              </h2>
              <p className="text-sm font-medium text-text-secondary">
                {isClientView
                  ? 'Total do cliente no periodo selecionado'
                  : 'Total no periodo selecionado'}
              </p>
            </div>
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

export function SelectedClientSummaryCard({
  clientName,
  rides,
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
              <span
                className={cn(
                  'rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]',
                  latestRide?.paymentStatus === 'PAID'
                    ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    : 'border-amber-500/20 bg-amber-500/10 text-amber-400',
                )}
              >
                {latestRide?.paymentStatus === 'PAID' ? 'Pago' : 'Pendente'}
              </span>
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

export function FinanceKpiGrid({
  currentPeriod,
  viewStats,
  byStatus,
}: FinanceKpiGridProps) {
  const accent = periodAccentClasses[currentPeriod.id];
  const paidValue = sumStatusValue(byStatus, 'PAID');
  const pendingValue = sumStatusValue(byStatus, 'PENDING');

  const items = [
    {
      label: 'Corridas',
      value: String(viewStats?.count || 0),
      helper: 'No periodo',
      icon: CarFront,
    },
    {
      label: 'Media',
      value: formatCurrency(viewStats?.ticketMedio || 0),
      helper: 'Por corrida',
      icon: TrendingUp,
    },
    {
      label: 'Recebido',
      value: formatCurrency(paidValue),
      helper: 'Pago',
      icon: Wallet,
    },
    {
      label: 'Pendente',
      value: formatCurrency(pendingValue),
      helper: 'A receber',
      icon: Clock3,
    },
    {
      label: 'Projecao',
      value: formatCurrency(viewStats?.projection || 0),
      helper: 'Estimativa',
      icon: Target,
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className="rounded-[1.5rem] border border-border-subtle bg-card-background p-4 shadow-sm md:p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
                  {item.label}
                </p>
                <p className="mt-3 text-2xl font-display font-extrabold tracking-tight text-text-primary">
                  {item.value}
                </p>
              </div>

              <div
                className={cn(
                  'rounded-2xl p-3',
                  accent.surface,
                  accent.text,
                )}
              >
                <Icon className="size-5" />
              </div>
            </div>
            <p className="mt-2 text-sm text-text-secondary">{item.helper}</p>
          </article>
        );
      })}
    </section>
  );
}

export function FinanceActionBar({
  currentPeriod,
  isLoading,
  hasData,
  onExport,
  onExportCSV,
}: FinanceActionBarProps) {
  const accent = periodAccentClasses[currentPeriod.id];
  const isDisabled = isLoading || !hasData;

  return (
    <section className="rounded-[1.75rem] border border-border-subtle bg-card-background p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Exportar
          </p>
          <span className="text-xs font-medium text-text-muted">
            PDF ou planilha
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={onExport}
            disabled={isDisabled}
            className={cn(
              'h-12 w-full rounded-2xl px-5 font-bold',
              accent.badge,
              isDisabled && 'opacity-50',
            )}
          >
            <Download className="mr-2 size-4" />
            Exportar PDF
          </Button>

          <Button
            onClick={onExportCSV}
            disabled={isDisabled}
            variant="outline"
            className="h-12 w-full rounded-2xl border-border-subtle bg-background px-5 font-bold text-text-primary"
          >
            <FileSpreadsheet className="mr-2 size-4 text-primary" />
            Exportar planilha
          </Button>
        </div>
      </div>
    </section>
  );
}

export function ClientHighlightsCard({ data }: ClientHighlightsCardProps) {
  const sortedClients = sortClients(data);
  const totalValue = sortedClients.reduce(
    (total, item) => total + Number(item.value || 0),
    0,
  );
  const topClient = sortedClients[0] ?? null;

  return (
    <section className="rounded-[3rem] border border-border bg-card/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-foreground">Clientes em destaque</h3>
        <p className="text-xs font-medium text-muted-foreground">
          Ranking rapido para complementar a distribuicao por cliente.
        </p>
      </div>

      {!sortedClients.length ? (
        <div className="rounded-[1.75rem] border border-dashed border-border-subtle bg-muted/20 py-10 text-center text-sm font-medium text-text-muted">
          Nenhum cliente com receita neste periodo.
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-[1.75rem] border border-border-subtle bg-background/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
              Lider de receita
            </p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-display font-extrabold text-text-primary">
                  {topClient?.clientName || 'Cliente'}
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  {formatCurrency(topClient?.value || 0)} no periodo
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                {totalValue && topClient ? ((topClient.value / totalValue) * 100).toFixed(0) : '0'}%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {sortedClients.slice(0, 5).map((client) => {
              const share = totalValue ? (client.value / totalValue) * 100 : 0;

              return (
                <div key={client.clientId || client.clientName} className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <p className="truncate text-sm font-semibold text-text-primary">
                      {client.clientName}
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

export function PaymentSummaryCard({ data }: PaymentSummaryCardProps) {
  const paidValue = sumStatusValue(data, 'PAID');
  const pendingValue = sumStatusValue(data, 'PENDING');
  const collectionRate = getCollectionRate(data);

  return (
    <section className="rounded-[3rem] border border-border bg-card/40 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h3 className="text-xl font-black text-foreground">Saude dos recebimentos</h3>
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
