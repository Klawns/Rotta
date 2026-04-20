'use client';

import { type AdminRecentUser, type PaginationMeta } from '@/types/admin';
import { RecentUsersTableList } from './recent-users-table-list';
import { RecentUsersTablePagination } from './recent-users-table-pagination';
import { RecentUsersTableToolbar } from './recent-users-table-toolbar';

interface RecentUsersTableProps {
  users: AdminRecentUser[];
  pagination: PaginationMeta;
  currentPage: number;
  isLoading: boolean;
  isUpdatingPlan: boolean;
  onCreateUser: () => void;
  onDeleteUser: (user: AdminRecentUser) => void;
  onUpdatePlan: (
    user: AdminRecentUser,
    plan: 'starter' | 'premium' | 'lifetime',
  ) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function RecentUsersTable({
  users,
  pagination,
  currentPage,
  isLoading,
  isUpdatingPlan,
  onCreateUser,
  onDeleteUser,
  onUpdatePlan,
  onPreviousPage,
  onNextPage,
}: RecentUsersTableProps) {
  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-border/80 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <RecentUsersTableToolbar onCreateUser={onCreateUser} />
      <RecentUsersTableList
        users={users}
        isLoading={isLoading}
        isUpdatingPlan={isUpdatingPlan}
        onDeleteUser={onDeleteUser}
        onUpdatePlan={onUpdatePlan}
      />
      <RecentUsersTablePagination
        usersCount={users.length}
        totalUsers={pagination.total}
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        isLoading={isLoading}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
      />
    </div>
  );
}
