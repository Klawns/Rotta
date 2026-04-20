'use client';

import type { UpdatePricingPlanInput } from '@/types/admin';

import { useAdminBillingPlansQuery } from './use-admin-billing-plans-query';
import { useUpdateAdminBillingPlan } from './use-update-admin-billing-plan';

export function useAdminBillingPlans() {
  const plansQuery = useAdminBillingPlansQuery();
  const updatePlanMutation = useUpdateAdminBillingPlan();

  return {
    plans: plansQuery.data ?? [],
    error: plansQuery.error,
    isLoading: plansQuery.isLoading,
    isFetching: plansQuery.isFetching,
    refetch: plansQuery.refetch,
    isSaving: updatePlanMutation.isPending,
    updatePlan: (planId: string, data: UpdatePricingPlanInput) =>
      updatePlanMutation.mutateAsync({ planId, data }),
  };
}
