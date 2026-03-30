'use client';

import { useQuery } from '@tanstack/react-query';
import { paymentKeys } from '@/lib/query-keys';
import { paymentsService } from '@/services/payments-service';

export function usePaymentPlans() {
  return useQuery({
    queryKey: paymentKeys.plans(),
    queryFn: ({ signal }) => paymentsService.getPlans(signal),
    staleTime: 1000 * 60 * 60,
  });
}
