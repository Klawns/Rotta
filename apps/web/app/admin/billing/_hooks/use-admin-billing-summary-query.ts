'use client';

import { useQuery } from '@tanstack/react-query';

import { adminKeys } from '@/lib/query-keys';
import { adminBillingService } from '@/services/admin-billing.service';

export function useAdminBillingSummaryQuery() {
  return useQuery({
    queryKey: adminKeys.billingSummary(),
    queryFn: ({ signal }) => adminBillingService.getSummary(signal),
  });
}
