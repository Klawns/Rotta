'use client';

import { motion } from 'framer-motion';

import { QueryErrorBoundary } from '@/components/query-error-boundary';
import { QueryErrorState } from '@/components/query-error-state';
import { AdminStatsGrid } from '../components/admin-stats-grid';
import { AdminCard, AdminPage, AdminPageHeader } from '../_components/admin-ui';
import { useAdminOverview } from './_hooks/use-admin-overview';

export default function AdminOverviewPage() {
  const { stats, statsError, isStatsPending, refetchStats } = useAdminOverview();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="fade-in"
    >
      <AdminPage>
        <AdminPageHeader
          title="Visao geral administrativa"
          description="Resumo operacional da base para acompanhar usuarios, assinaturas e receita recente."
        />

        <QueryErrorBoundary message="Nao foi possivel carregar as estatisticas do painel.">
          {statsError && !stats ? (
            <QueryErrorState
              error={statsError}
              title="Nao foi possivel carregar as estatisticas do painel"
              onRetry={() => {
                void refetchStats();
              }}
            />
          ) : (
            <div className="space-y-4">
              {statsError ? (
                <QueryErrorState
                  error={statsError}
                  title="Falha ao atualizar as estatisticas"
                  description="Os dados em cache foram mantidos, mas a ultima atualizacao falhou."
                  onRetry={() => {
                    void refetchStats();
                  }}
                />
              ) : null}

              {stats ? <AdminStatsGrid stats={stats} /> : null}

              {isStatsPending && !stats ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {[1, 2, 3].map((item) => (
                    <AdminCard
                      key={item}
                      className="h-40 animate-pulse border-dashed bg-white/60"
                    />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </QueryErrorBoundary>
      </AdminPage>
    </motion.div>
  );
}
