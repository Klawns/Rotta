'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { invalidatePlanCachesAfterAdminUpdate } from '@/hooks/payment-plans-query-options';
import { parseApiError } from '@/lib/api-error';
import { adminBillingService } from '@/services/admin-billing.service';
import type { UpdatePricingPlanInput } from '@/types/admin';

interface UpdatePlanMutationInput {
  planId: string;
  data: UpdatePricingPlanInput;
}

export function useUpdateAdminBillingPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }: UpdatePlanMutationInput) =>
      adminBillingService.updatePlan(planId, data),
    onSuccess: async () => {
      await invalidatePlanCachesAfterAdminUpdate(queryClient);
      toast.success('Plano atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao atualizar plano'));
    },
  });
}
