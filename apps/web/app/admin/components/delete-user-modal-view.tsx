import { AlertTriangle, Loader2, Trash2 } from 'lucide-react';

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
import { type DeleteUserDialogState } from '../_hooks/use-delete-user-dialog';

interface DeleteUserModalViewProps {
  dialog: DeleteUserDialogState;
}

export function DeleteUserModalView({ dialog }: DeleteUserModalViewProps) {
  return (
    <Dialog open={dialog.open} onOpenChange={dialog.handleOpenChange}>
      <DialogContent className="max-w-sm rounded-[1.75rem] border-border bg-white text-slate-950">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-red-600">
            <AlertTriangle size={24} />
            Excluir usuário?
          </DialogTitle>
          <DialogDescription className="text-slate-500">
            Esta ação é irreversível. O usuário <strong>{dialog.user?.name}</strong>{' '}
            ({dialog.user?.email}) será removido permanentemente, junto com todas
            as suas corridas e clientes.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4 pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            dialog.handleConfirm();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="delete-user-confirmation" className="text-sm font-semibold">
              Digite{' '}
              <span className="text-red-600">
                {dialog.requiredConfirmationText}
              </span>{' '}
              para confirmar:
            </Label>
            <Input
              id="delete-user-confirmation"
              placeholder="Digite aqui..."
              autoFocus
              value={dialog.confirmationValue}
              onChange={(event) =>
                dialog.handleConfirmationChange(event.target.value)
              }
              disabled={dialog.isDeleting}
              className="border-border bg-white"
            />
          </div>

          {dialog.error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {dialog.error}
            </div>
          ) : null}

          <DialogFooter className="gap-2 pt-6 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={dialog.handleCancel}
              disabled={dialog.isDeleting}
              className="border-border bg-white text-slate-700 hover:bg-slate-100"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={dialog.isConfirmDisabled}
              className="gap-2 bg-red-600 font-bold text-white hover:bg-red-500"
            >
              {dialog.isDeleting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Confirmar exclusão
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
