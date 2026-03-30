'use client';

import { UpdatePricingPlanInput } from '@/types/admin';
import { useAdminPlansQuery } from './use-admin-plans-query';
import { useUpdateAdminPlan } from './use-update-admin-plan';

export function useAdminPlans() {
  const plansQuery = useAdminPlansQuery();
  const updatePlanMutation = useUpdateAdminPlan();

  return {
    plans: plansQuery.data ?? [],
    isLoading: plansQuery.isLoading,
    isSaving: updatePlanMutation.isPending,
    updatePlan: (planId: string, data: UpdatePricingPlanInput) =>
      updatePlanMutation.mutateAsync({ planId, data }),
  };
}
