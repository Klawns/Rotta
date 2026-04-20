'use client';

import { motion } from 'framer-motion';
import { useState, type FormEvent } from 'react';

import {
  AdminCard,
  AdminPage,
  AdminPageHeader,
} from '@/app/admin/_components/admin-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAdminPasswordChange } from './_hooks/use-admin-password-change';

export default function SecuritySettingsPage() {
  return (
    <AdminPage>
      <AdminPageHeader
        badge="Sistema"
        title="Seguranca de conta"
        description="Mantenha suas credenciais administrativas seguras sem alterar o acesso via provedores externos."
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl"
      >
        <AdminCard className="bg-gradient-to-br from-white via-white to-blue-50/60">
          <PasswordChangeForm />
        </AdminCard>
      </motion.div>
    </AdminPage>
  );
}

function PasswordChangeForm() {
  const { changePassword, isSubmitting } = useAdminPasswordChange();
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    const result = await changePassword(form);
    setMessage(result);

    if (result.type === 'success') {
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">
          Senha atual
        </label>
        <Input
          name="currentPassword"
          type="password"
          required
          value={form.currentPassword}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              currentPassword: event.target.value,
            }))
          }
          className="h-12 rounded-xl border-border bg-white font-mono"
          placeholder="********"
        />
      </div>
      <div className="space-y-2">
        <label className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">
          Nova senha
        </label>
        <Input
          name="newPassword"
          type="password"
          required
          value={form.newPassword}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              newPassword: event.target.value,
            }))
          }
          className="h-12 rounded-xl border-border bg-white font-mono"
          placeholder="********"
        />
      </div>
      <div className="space-y-2">
        <label className="pl-1 text-xs font-bold uppercase tracking-widest text-slate-500">
          Confirmar nova senha
        </label>
        <Input
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              confirmPassword: event.target.value,
            }))
          }
          className="h-12 rounded-xl border-border bg-white font-mono"
          placeholder="********"
        />
      </div>

      {message ? (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            'mt-4 rounded-xl border p-4 text-sm font-medium',
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700',
          )}
        >
          {message.text}
        </motion.p>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-4 h-12 w-full rounded-xl bg-emerald-600 text-xs font-bold uppercase tracking-widest text-white hover:bg-emerald-500"
      >
        {isSubmitting ? 'Autenticando...' : 'Atualizar credenciais'}
      </Button>
    </form>
  );
}
