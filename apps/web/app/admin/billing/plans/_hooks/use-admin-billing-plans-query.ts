'use client';

import { useQuery } from '@tanstack/react-query';

import { adminKeys } from '@/lib/query-keys';
import { adminBillingService } from '@/services/admin-billing.service';

export function useAdminBillingPlansQuery() {
  return useQuery({
    queryKey: adminKeys.billingPlans(),
    queryFn: ({ signal }) => adminBillingService.getPlans(signal),
  });
}
