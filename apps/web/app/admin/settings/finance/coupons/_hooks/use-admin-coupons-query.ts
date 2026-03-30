'use client';

import { useQuery } from '@tanstack/react-query';
import { adminKeys } from '@/lib/query-keys';
import { paymentsService } from '@/services/payments-service';

export function useAdminCouponsQuery() {
  return useQuery({
    queryKey: adminKeys.promoCodes(),
    queryFn: ({ signal }) => paymentsService.getPromoCodes(signal),
  });
}
