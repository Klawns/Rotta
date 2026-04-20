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
import { type AdminUsersTableRowViewModel } from '../users/_presenters/admin-users-table.presenter';

type UserPlan = 'starter' | 'premium' | 'lifetime';

interface RecentUsersTableListProps {
  rows: AdminUsersTableRowViewModel[];
  isLoading: boolean;
  isUpdatingPlan: boolean;
  onDeleteUser: (user: AdminRecentUser) => void;
  onUpdatePlan: (user: AdminRecentUser, plan: UserPlan) => void;
}

function getPlanBadgeClassName(planTone: AdminUsersTableRowViewModel['planTone']) {
  if (planTone === 'accent') {
    return 'bg-violet-100 text-violet-700 hover:bg-violet-200';
  }

  if (planTone === 'success') {
    return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
  }

  return 'bg-slate-100 text-slate-600 hover:bg-slate-200';
}

export function RecentUsersTableList({
  rows,
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
      <tbody className="divide-y divide-border/70">
        {isLoading ? (
          [1, 2, 3].map((item) => (
            <tr key={item} className="animate-pulse">
              <td colSpan={4} className="h-20 bg-slate-50 px-8 py-6" />
            </tr>
          ))
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-8 py-10 text-center italic text-slate-500">
              Nenhum usuario encontrado.
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} className="group transition-colors hover:bg-slate-50/80">
              <td className="px-8 py-6 font-semibold text-slate-950">{row.name}</td>
              <td className="px-8 py-6 text-slate-600">{row.email}</td>
              <td className="px-8 py-6">
                {row.roleBadgeLabel ? (
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-extrabold uppercase text-blue-700">
                    {row.roleBadgeLabel}
                  </span>
                ) : (
                  <Select
                    value={row.planValue}
                    onValueChange={(nextPlan) =>
                      onUpdatePlan(row.user, nextPlan as UserPlan)
                    }
                    disabled={isUpdatingPlan || !row.canManagePlan}
                  >
                    <SelectTrigger
                      className={cn(
                        'h-7 border-none px-3 text-[10px] font-extrabold uppercase tracking-widest shadow-none focus:ring-0 focus:ring-offset-0',
                        getPlanBadgeClassName(row.planTone),
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-white text-slate-700">
                      <SelectItem
                        value="starter"
                        className="cursor-pointer text-[10px] font-bold uppercase tracking-widest focus:bg-slate-100 focus:text-slate-950"
                      >
                        Starter
                      </SelectItem>
                      <SelectItem
                        value="premium"
                        className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700"
                      >
                        Premium
                      </SelectItem>
                      <SelectItem
                        value="lifetime"
                        className="cursor-pointer text-[10px] font-bold uppercase tracking-widest text-violet-700 focus:bg-violet-50 focus:text-violet-700"
                      >
                        Lifetime
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {row.planDetails ? (
                  <div className="ml-2 mt-1 text-[10px] font-semibold text-slate-500">
                    {row.planDetails}
                  </div>
                ) : null}
              </td>
              <td className="px-8 py-6 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onDeleteUser(row.user)}
                    className="p-2 text-red-500 opacity-0 transition-opacity hover:text-red-600 group-hover:opacity-100"
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
