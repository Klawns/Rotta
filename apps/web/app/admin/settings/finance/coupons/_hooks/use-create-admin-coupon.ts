'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { adminKeys } from '@/lib/query-keys';
import { paymentsService } from '@/services/payments-service';
import { CreatePromoCodeInput } from '@/types/payments';

export function useCreateAdminCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePromoCodeInput) =>
      paymentsService.createPromoCode(data),
    onSuccess: async () => {
      toast.success('Cupom criado com sucesso!');
      await queryClient.invalidateQueries({ queryKey: adminKeys.promoCodes() });
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao criar cupom'));
    },
  });
}
