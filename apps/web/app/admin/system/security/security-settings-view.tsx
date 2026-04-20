'use client';

import { useState, type FormEvent } from 'react';

import {
  AdminCard,
  AdminInlineNotice,
  AdminPage,
  AdminPageHeader,
} from '@/app/admin/_components/admin-ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdminPasswordChange } from './_hooks/use-admin-password-change';

export function SecuritySettingsView() {
  return (
    <AdminPage>
      <AdminPageHeader
        title="Seguranca de conta"
        description="Atualize as credenciais administrativas com um fluxo direto e feedback claro."
      />

      <AdminCard className="max-w-2xl">
        <PasswordChangeForm />
      </AdminCard>
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

    if (form.newPassword !== form.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'A confirmacao da nova senha deve ser igual a senha informada.',
      });
      return;
    }

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
        <Label className="pl-1">Senha atual</Label>
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
        <Label className="pl-1">Nova senha</Label>
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
        <Label className="pl-1">Confirmar nova senha</Label>
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
        <AdminInlineNotice tone={message.type === 'success' ? 'success' : 'danger'}>
          {message.text}
        </AdminInlineNotice>
      ) : null}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-xl"
      >
        {isSubmitting ? 'Salvando...' : 'Salvar nova senha'}
      </Button>
    </form>
  );
}
