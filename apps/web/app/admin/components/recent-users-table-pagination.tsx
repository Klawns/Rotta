'use client';

import { type AdminUsersPaginationViewModel } from '../users/_presenters/admin-users-table.presenter';

interface RecentUsersTablePaginationProps {
  pagination: AdminUsersPaginationViewModel;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function RecentUsersTablePagination({
  pagination,
  onPreviousPage,
  onNextPage,
}: RecentUsersTablePaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border/70 bg-slate-50/80 p-8">
      <p className="text-sm text-slate-500">{pagination.summary}</p>
      <div className="flex items-center gap-3">
        <button
          onClick={onPreviousPage}
          disabled={pagination.isPreviousDisabled}
          className="rounded-xl border border-border bg-white px-5 py-2.5 font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950 disabled:opacity-30"
        >
          Anterior
        </button>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700">
          {pagination.currentPageLabel}
        </div>
        <button
          onClick={onNextPage}
          disabled={pagination.isNextDisabled}
          className="rounded-xl border border-border bg-white px-5 py-2.5 font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950 disabled:opacity-30"
        >
          Proximo
        </button>
      </div>
    </div>
  );
}
