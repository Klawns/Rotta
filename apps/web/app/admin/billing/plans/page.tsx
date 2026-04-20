'use client';

import {
  AdminLoadingState,
  AdminPage,
  AdminPageHeader,
} from '@/app/admin/_components/admin-ui';
import { QueryErrorState } from '@/components/query-error-state';

import { PlanCard } from './_components/plan-card';
import { useAdminBillingPlans } from './_hooks/use-admin-billing-plans';

export default function AdminBillingPlansPage() {
  const { plans, error, isLoading, isSaving, refetch, updatePlan } =
    useAdminBillingPlans();

  if (isLoading && plans.length === 0) {
    return (
      <AdminLoadingState
        title="Carregando planos"
        description="Buscando os planos disponiveis para edicao."
      />
    );
  }

  if (error && plans.length === 0) {
    return (
      <QueryErrorState
        error={error}
        title="Nao foi possivel carregar os planos de faturamento"
        description="Revise a conectividade da area administrativa e tente novamente."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        title="Planos de precos"
        description="Configure os valores e intervalos das assinaturas ativas na plataforma."
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onSave={updatePlan}
            isGlobalSaving={isSaving}
          />
        ))}
      </div>
    </AdminPage>
  );
}
