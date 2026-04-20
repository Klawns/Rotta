'use client';

import { motion } from 'framer-motion';

import {
  AdminCard,
  AdminLoadingState,
  AdminPage,
  AdminPageHeader,
} from '@/app/admin/_components/admin-ui';
import { QueryErrorState } from '@/components/query-error-state';
import { cn } from '@/lib/utils';
import { useAdminBillingSummary } from './_hooks/use-admin-billing-summary';

function getGatewayToneClassName(tone: 'success' | 'warning' | 'muted') {
  switch (tone) {
    case 'success':
      return 'border-success/20 bg-success/10 text-success';
    case 'warning':
      return 'border-warning/20 bg-warning/10 text-warning';
    case 'muted':
    default:
      return 'border-border bg-background/80 text-muted-foreground';
  }
}

export default function AdminBillingSummaryPage() {
  const { summary, presentation, isLoading, error, refetch } =
    useAdminBillingSummary();

  if (isLoading && !summary) {
    return (
      <AdminLoadingState
        title="Carregando resumo de faturamento"
        description="Buscando capacidade do gateway e metricas principais."
      />
    );
  }

  if (error && !summary) {
    return (
      <QueryErrorState
        error={error}
        title="Nao foi possivel carregar o resumo de faturamento"
        description="Revise o estado do gateway e tente novamente."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (!presentation) {
    return null;
  }

  const metricCards = Object.values(presentation.metrics);
  const gatewayStatus = summary?.gateway.status ?? '--';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fade-in"
    >
      <AdminPage>
        <AdminPageHeader
          badge="Faturamento"
          title="Resumo de billing"
          description="Visao geral do dominio de faturamento com fallbacks e capacidade do gateway centralizados."
        />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
          <AdminCard className="space-y-5">
            <div className="space-y-3">
              <span
                className={cn(
                  'inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em]',
                  getGatewayToneClassName(presentation.gateway.tone),
                )}
              >
                {presentation.gateway.badgeLabel}
              </span>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  Capability do gateway
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {presentation.gateway.description}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Provider
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {presentation.gateway.providerLabel}
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-border/80 bg-background/70 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  Estado bruto
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                  {gatewayStatus}
                </p>
              </div>
            </div>
          </AdminCard>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {metricCards.map((metric) => (
              <AdminCard key={metric.label} className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {metric.label}
                </p>
                <p className="text-3xl font-semibold tracking-tight text-foreground">
                  {metric.value}
                </p>
              </AdminCard>
            ))}
          </div>
        </div>
      </AdminPage>
    </motion.div>
  );
}
