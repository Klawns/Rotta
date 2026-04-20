'use client';

import {
  AdminLoadingState,
  AdminPage,
  AdminPageHeader,
} from '@/app/admin/_components/admin-ui';
import { PlanCard } from './_components/plan-card';
import { useAdminPlans } from './_hooks/use-admin-plans';

export default function PlansPage() {
  const { plans, isLoading, isSaving, updatePlan } = useAdminPlans();

  if (isLoading) {
    return (
      <AdminLoadingState
        title="Carregando planos"
        description="Buscando os planos disponiveis para edicao."
      />
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        badge="Faturamento"
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
