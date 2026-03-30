'use client';

import { useQuery } from '@tanstack/react-query';
import { adminKeys } from '@/lib/query-keys';
import { adminService } from '@/services/admin-service';

export function useAdminPlansQuery() {
  return useQuery({
    queryKey: adminKeys.plans(),
    queryFn: ({ signal }) => adminService.getPlans(signal),
  });
}
