'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, DollarSign, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { parseApiError } from '@/lib/api-error';
import { upsertClientPaymentCaches } from '@/lib/client-cache';
import { invalidateRideCachesForClient } from '@/lib/ride-cache';
import { clientKeys, financeKeys } from '@/lib/query-keys';
import { clientsService } from '@/services/clients-service';
import { type CreateClientPaymentInput } from '@/types/client-payments';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  clientName: string;
}

interface PaymentModalFormProps extends Omit<PaymentModalProps, 'isOpen'> {}

function PaymentModalForm({
  onClose,
  onSuccess,
  clientId,
  clientName,
}: PaymentModalFormProps) {
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateClientPaymentInput) =>
      clientsService.addClientPayment(clientId, payload),
    onSuccess: async (payment) => {
      upsertClientPaymentCaches(queryClient, payment);

      await Promise.all([
        invalidateRideCachesForClient(queryClient, clientId),
        queryClient.invalidateQueries({
          queryKey: clientKeys.detail(clientId),
          exact: true,
        }),
        queryClient.invalidateQueries({
          queryKey: clientKeys.balance(clientId),
          exact: true,
        }),
        queryClient.invalidateQueries({ queryKey: financeKeys.all }),
      ]);

      toast.success('Pagamento registrado com sucesso.');
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(
        parseApiError(error, 'Erro ao registrar pagamento. Tente novamente.'),
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!clientId || !amount) {
      return;
    }

    mutation.mutate({
      amount: Number(amount),
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="relative flex flex-col">
      <button
        onClick={onClose}
        className="group absolute right-6 top-6 z-20 rounded-xl border border-border-subtle bg-secondary/10 p-2.5 text-text-secondary shadow-lg transition-all hover:bg-secondary/20 hover:text-text-primary sm:right-10 sm:top-10"
        title="Fechar"
      >
        <X size={20} className="transition-transform duration-300 group-hover:rotate-90" />
      </button>

      <div className="px-6 pt-8 pb-8 sm:px-10 sm:pt-12">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-icon-info/10 bg-icon-info/10 font-black text-icon-info shadow-inner">
            <DollarSign size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black leading-none tracking-tighter text-text-primary sm:text-2xl">
              Registrar Pagamento
            </h2>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary opacity-70 sm:text-xs">
              Pagamento Parcial / Antecipado
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-6 space-y-3 rounded-2xl border border-border-subtle bg-background/30 p-4">
            <p className="mb-0.5 text-[9px] font-black uppercase tracking-widest leading-none text-text-secondary">
              Cliente
            </p>
            <p className="font-bold text-text-primary">{clientName}</p>
          </div>

          <div className="space-y-4">
            <label className="pl-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
              Valor do Pagamento
            </label>
            <div className="group relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-black text-text-secondary">
                R$
              </span>
              <input
                autoFocus
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0,00"
                className="w-full rounded-2xl border border-border-subtle bg-background/50 py-4 pl-12 pr-4 text-xl font-black text-text-primary transition-all placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="pl-1 text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">
              Observações (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ex: Pagou em dinheiro, via Pix..."
              rows={3}
              className="w-full resize-none rounded-[2rem] border border-border-subtle bg-background/50 py-5 px-6 text-sm font-bold text-text-primary transition-all placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || !amount}
            className="mt-4 flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-button-primary font-black text-button-primary-foreground shadow-lg shadow-button-shadow transition-all active:scale-[0.98] hover:bg-button-primary-hover disabled:opacity-50"
          >
            {mutation.isPending ? (
              <div className="h-6 w-6 animate-spin rounded-full border-[3px] border-primary-foreground/30 border-t-primary-foreground" />
            ) : (
              <>
                CONFIRMAR PAGAMENTO
                <CheckCircle2 size={24} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export function PaymentModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  clientName,
}: PaymentModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-lg gap-0 overflow-hidden border-border bg-modal-background p-0 shadow-2xl sm:max-w-[480px] sm:rounded-[2.5rem]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Registrar Pagamento Parcial</DialogTitle>
          <DialogDescription>
            Informe o valor pago pelo cliente {clientName}.
          </DialogDescription>
        </DialogHeader>

        <PaymentModalForm
          key={`${clientId || 'empty'}:${isOpen ? 'open' : 'closed'}`}
          onClose={onClose}
          onSuccess={onSuccess}
          clientId={clientId}
          clientName={clientName}
        />
      </DialogContent>
    </Dialog>
  );
}
