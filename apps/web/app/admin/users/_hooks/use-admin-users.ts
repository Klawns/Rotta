'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminKeys } from '@/lib/query-keys';
import { adminService } from '@/services/admin-service';
import { type AdminRecentUser } from '@/types/admin';
import { invalidateAdminDashboardQueries } from '../../_lib/admin-dashboard-query-cache';

export function useAdminUsers(currentPage: number) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: adminKeys.users({ page: currentPage, limit: 10 }),
    queryFn: ({ signal }) =>
      adminService.getRecentUsers(
        {
          page: currentPage,
          limit: 10,
        },
        signal,
      ),
  });

  const updatePlanMutation = useMutation({
    mutationFn: adminService.updateUserPlan,
    onSuccess: () => invalidateAdminDashboardQueries(queryClient),
  });

  return {
    users: usersQuery.data?.data ?? null,
    pagination: usersQuery.data?.meta ?? null,
    usersError: usersQuery.error ?? null,
    isUsersPending: usersQuery.isPending,
    refetchUsers: usersQuery.refetch,
    isUpdatingUserPlan: updatePlanMutation.isPending,
    handleUpdateUserPlan: (
      user: AdminRecentUser,
      plan: 'starter' | 'premium' | 'lifetime',
    ) =>
      updatePlanMutation.mutateAsync({
        userId: user.id,
        plan,
      }),
  };
}
