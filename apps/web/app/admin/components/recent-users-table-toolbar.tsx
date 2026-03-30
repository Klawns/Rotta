'use client';

import { UserPlus } from 'lucide-react';

interface RecentUsersTableToolbarProps {
  onCreateUser: () => void;
}

export function RecentUsersTableToolbar({
  onCreateUser,
}: RecentUsersTableToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 bg-white/5 p-8">
      <h2 className="text-xl font-bold text-white">Usuarios Recentes</h2>

      <button
        onClick={onCreateUser}
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] hover:bg-blue-500"
      >
        <UserPlus size={14} />
        Novo Usuario
      </button>
    </div>
  );
}
