import type { AdminRecentUser } from '@/types/admin';

type UserPlan = 'starter' | 'premium' | 'lifetime';
type UserPlanTone = 'neutral' | 'success' | 'accent';

export interface AdminUsersTableRowViewModel {
  id: string;
  user: AdminRecentUser;
  name: string;
  email: string;
  canManagePlan: boolean;
  roleBadgeLabel: string | null;
  planValue: UserPlan;
  planTone: UserPlanTone;
  planDetails: string | null;
}

interface AdminUsersPaginationInput {
  usersCount: number;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
}

export interface AdminUsersPaginationViewModel {
  summary: string;
  currentPageLabel: string;
  isPreviousDisabled: boolean;
  isNextDisabled: boolean;
}

function resolvePlanValue(plan: AdminRecentUser['plan']): UserPlan {
  return plan ?? 'starter';
}

function resolvePlanTone(plan: UserPlan): UserPlanTone {
  if (plan === 'premium') {
    return 'success';
  }

  if (plan === 'lifetime') {
    return 'accent';
  }

  return 'neutral';
}

function formatDaysLeft(daysLeft: number | null) {
  if (daysLeft === null) {
    return null;
  }

  return daysLeft === 1 ? '1 dia restante' : `${daysLeft} dias restantes`;
}

export function presentAdminUsersTableRows(
  users: AdminRecentUser[],
): AdminUsersTableRowViewModel[] {
  return users.map((user) => {
    const planValue = resolvePlanValue(user.plan);
    const shouldShowDaysLeft = planValue === 'premium' && user.daysLeft !== null;

    return {
      id: user.id,
      user,
      name: user.name,
      email: user.email,
      canManagePlan: user.role !== 'admin',
      roleBadgeLabel: user.role === 'admin' ? 'Admin' : null,
      planValue,
      planTone: resolvePlanTone(planValue),
      planDetails: shouldShowDaysLeft ? formatDaysLeft(user.daysLeft) : null,
    };
  });
}

export function presentAdminUsersPagination({
  usersCount,
  totalUsers,
  currentPage,
  totalPages,
  isLoading,
}: AdminUsersPaginationInput): AdminUsersPaginationViewModel {
  const resolvedTotalPages = Math.max(1, totalPages);
  const resolvedCurrentPage = Math.min(
    Math.max(1, currentPage),
    resolvedTotalPages,
  );

  return {
    summary: `Mostrando ${usersCount} de ${totalUsers} usuarios`,
    currentPageLabel: `${resolvedCurrentPage} / ${resolvedTotalPages}`,
    isPreviousDisabled: isLoading || resolvedCurrentPage === 1,
    isNextDisabled: isLoading || resolvedCurrentPage === resolvedTotalPages,
  };
}
