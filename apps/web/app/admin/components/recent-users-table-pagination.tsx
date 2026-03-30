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
    <div className="flex items-center justify-between border-t border-white/5 bg-white/5 p-8">
      <p className="text-sm text-slate-500">
        Mostrando <span className="font-medium text-white">{usersCount}</span> de{' '}
        <span className="font-medium text-white">{totalUsers}</span> usuarios
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={onPreviousPage}
          disabled={currentPage === 1 || isLoading}
          className="rounded-xl border border-white/5 bg-slate-900/50 px-5 py-2.5 font-semibold text-slate-400 transition-all hover:bg-slate-800 hover:text-white disabled:opacity-30"
        >
          Anterior
        </button>
        <div className="rounded-xl border border-white/5 bg-white/5 px-4 py-2.5 text-sm font-bold text-blue-400">
          {currentPage} / {totalPages}
        </div>
        <button
          onClick={onNextPage}
          disabled={currentPage === totalPages || isLoading}
          className="rounded-xl border border-white/5 bg-slate-900/50 px-5 py-2.5 font-semibold text-slate-400 transition-all hover:bg-slate-800 hover:text-white disabled:opacity-30"
        >
          Proximo
        </button>
      </div>
    </div>
  );
}
