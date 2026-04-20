'use client';

interface RecentUsersTablePaginationProps {
  usersCount: number;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function RecentUsersTablePagination({
  usersCount,
  totalUsers,
  currentPage,
  totalPages,
  isLoading,
  onPreviousPage,
  onNextPage,
}: RecentUsersTablePaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-border/70 bg-slate-50/80 p-8">
      <p className="text-sm text-slate-500">
        Mostrando <span className="font-medium text-slate-950">{usersCount}</span>{' '}
        de <span className="font-medium text-slate-950">{totalUsers}</span>{' '}
        usuarios
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1 || isLoading}
          className="rounded-xl border border-border bg-white px-5 py-2.5 font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950 disabled:opacity-30"
        >
          Anterior
        </button>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700">
          {currentPage} / {totalPages}
        </div>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages || isLoading}
          className="rounded-xl border border-border bg-white px-5 py-2.5 font-semibold text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-950 disabled:opacity-30"
        >
          Proximo
        </button>
      </div>
    </div>
  );
}
