'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { adminKeys } from '@/lib/query-keys';
import { adminService } from '@/services/admin-service';
import { UpdatePricingPlanInput } from '@/types/admin';

interface UpdatePlanMutationInput {
  planId: string;
  data: UpdatePricingPlanInput;
}

export function useUpdateAdminPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ planId, data }: UpdatePlanMutationInput) =>
      adminService.updatePlan(planId, data),
    onSuccess: async () => {
      toast.success('Plano atualizado com sucesso!');
      await queryClient.invalidateQueries({ queryKey: adminKeys.plans() });
      await queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() });
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao atualizar plano'));
    },
  });
}
