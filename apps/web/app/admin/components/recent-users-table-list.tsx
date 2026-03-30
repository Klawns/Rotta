'use client';

import { Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type AdminRecentUser } from '@/types/admin';

type UserPlan = 'starter' | 'premium' | 'lifetime';

interface RecentUsersTableListProps {
  users: AdminRecentUser[];
  isLoading: boolean;
  isUpdatingPlan: boolean;
  onDeleteUser: (user: AdminRecentUser) => void;
  onUpdatePlan: (user: AdminRecentUser, plan: UserPlan) => void;
}

function getPlanBadgeClassName(plan: AdminRecentUser['plan']) {
  if (plan === 'lifetime') {
    return 'bg-violet-500/10 text-violet-400 hover:bg-violet-500/20';
  }

  if (plan === 'premium') {
    return 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20';
  }

  return 'bg-slate-500/10 text-slate-400 hover:bg-slate-500/20';
}

export function RecentUsersTableList({
  users,
  isLoading,
  isUpdatingPlan,
  onDeleteUser,
  onUpdatePlan,
}: RecentUsersTableListProps) {
  return (
    <table className="w-full text-left">
      <thead>
        <tr className="text-xs font-bold uppercase tracking-widest text-slate-500">
          <th className="px-8 py-5">Usuario</th>
          <th className="px-8 py-5">Email</th>
          <th className="px-8 py-5">Plano</th>
          <th className="px-8 py-5 text-right">Acao</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-white/5">
        {isLoading ? (
          [1, 2, 3].map((item) => (
            <tr key={item} className="animate-pulse">
              <td colSpan={4} className="h-20 bg-white/5 px-8 py-6" />
            </tr>
          ))
        ) : users.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-8 py-10 text-center italic text-slate-500">
              Nenhum usuario encontrado.
            </td>
          </tr>
        ) : (
          users.map((user) => (
            <tr key={user.id} className="group transition-colors hover:bg-white/5">
              <td className="px-8 py-6 font-semibold text-white">{user.name}</td>
              <td className="px-8 py-6 text-slate-400">{user.email}</td>
              <td className="px-8 py-6">
                {user.role === 'admin' ? (
                  <span className="rounded-full bg-blue-500/10 px-3 py-1 text-[10px] font-extrabold uppercase text-blue-400">
                    Admin
                  </span>
                ) : (
                  <Select
                    value={user.plan || 'starter'}
                    onValueChange={(nextPlan) =>
                      onUpdatePlan(user, nextPlan as UserPlan)
                    }
                    disabled={isUpdatingPlan}
                  >
                    <SelectTrigger
                      className={cn(
                        'h-7 border-none px-3 text-[10px] font-extrabold uppercase tracking-widest shadow-none focus:ring-0 focus:ring-offset-0',
                        getPlanBadgeClassName(user.plan),
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-slate-800 bg-slate-950 text-slate-300">
                      <SelectItem
                        value="starter"
                        className="cursor-pointer text-[10px] font-bold uppercase tracking-widest focus:bg-slate-800 focus:text-slate-300"
                      >
                        Starter
                      </SelectItem>
                      <SelectItem
                        value="premium"
                        className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-emerald-400 focus:bg-emerald-500/20 focus:text-emerald-400"
                      >
                        Premium
                      </SelectItem>
                      <SelectItem
                        value="lifetime"
                        className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-violet-400 focus:bg-violet-500/20 focus:text-violet-400"
                      >
                        Lifetime
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {user.plan === 'premium' && user.daysLeft !== null ? (
                  <div className="ml-2 mt-1 text-[10px] font-semibold text-slate-500">
                    {user.daysLeft} dias restantes
                  </div>
                ) : null}
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onDeleteUser(user)}
                    className="p-2 text-red-400 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
