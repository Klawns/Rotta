import { Loader2, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type CreateUserDialogState } from '../_hooks/use-create-user-dialog';

interface CreateUserModalViewProps {
  dialog: CreateUserDialogState;
}

export function CreateUserModalView({ dialog }: CreateUserModalViewProps) {
  return (
    <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
      <DialogContent className="max-w-md rounded-[1.75rem] border-border bg-white text-slate-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-700">
            <UserPlus size={24} />
            Cadastrar novo usuário
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Preencha os dados abaixo para criar uma conta manualmente para o
            cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={dialog.handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold">
              Nome completo
            </Label>
            <Input
              id="name"
              name="name"
              required
              autoComplete="name"
              value={dialog.form.name}
              onChange={(event) =>
                dialog.handleFieldChange('name', event.target.value)
              }
              placeholder="Nome do cliente"
              className="border-border bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={dialog.form.email}
              onChange={(event) =>
                dialog.handleFieldChange('email', event.target.value)
              }
              placeholder="cliente@email.com"
              className="border-border bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">
              Senha inicial
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={dialog.form.password}
              onChange={(event) =>
                dialog.handleFieldChange('password', event.target.value)
              }
              placeholder="******"
              className="border-border bg-white"
            />
          </div>

          {dialog.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {dialog.error}
            </div>
          ) : null}

          <DialogFooter className="pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={dialog.handleCancel}
              disabled={dialog.isSubmitting}
              className="border-border bg-white text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={dialog.isSubmitDisabled}
              className="min-w-[120px] gap-2 bg-blue-600 font-bold text-white hover:bg-blue-500"
            >
              {dialog.isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                'Criar usuário'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
