'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '@/lib/query-keys';
import { parseApiError } from '@/lib/api-error';
import { adminService } from '@/services/admin-service';
import { AdminRecentUser } from '@/types/admin';

export function useAdminDashboard(currentPage: number, enabled: boolean) {
  const queryClient = useQueryClient();

  const statsQuery = useQuery({
    queryKey: adminKeys.stats(),
    queryFn: ({ signal }) => adminService.getStats(signal),
    enabled,
  });

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
    enabled,
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() });
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
    },
  });

  const updatePlanMutation = useMutation({
    mutationFn: adminService.updateUserPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.usersAll() });
    },
  });

  return {
    stats: statsQuery.data ?? {
      totalUsers: 0,
      activeSubscriptions: 0,
      revenue30d: 0,
    },
    users: usersQuery.data?.data ?? [],
    pagination: usersQuery.data?.meta ?? {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    isLoadingUsers: usersQuery.isLoading,
    isUpdatingUserPlan: updatePlanMutation.isPending,
    handleDeleteUser: (userId: string) =>
      deleteUserMutation.mutateAsync(userId),
    handleUpdateUserPlan: (
      user: AdminRecentUser,
      plan: 'starter' | 'premium' | 'lifetime',
    ) =>
      updatePlanMutation.mutateAsync({
        userId: user.id,
        plan,
      }),
    deleteUserError: deleteUserMutation.error
      ? parseApiError(deleteUserMutation.error)
      : null,
    updatePlanError: updatePlanMutation.error
      ? parseApiError(updatePlanMutation.error)
      : null,
  };
}
