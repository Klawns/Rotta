'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, MapPin, Phone, User, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { parseApiError } from '@/lib/api-error';
import { upsertClientCaches } from '@/lib/client-cache';
import { clientsService } from '@/services/clients-service';
import { type Client } from '@/types/rides';

type ClientFormPayload = Pick<Client, 'name' | 'phone' | 'address'>;

function getInitialFormValues(clientToEdit?: Client): ClientFormPayload {
  return {
    name: clientToEdit?.name || '',
    phone: clientToEdit?.phone || '',
    address: clientToEdit?.address || '',
  };
}

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (client: Client) => void;
  clientToEdit?: Client;
}

interface ClientModalFormProps extends Omit<ClientModalProps, 'isOpen'> {}

function ClientModalForm({
  onClose,
  onSuccess,
  clientToEdit,
}: ClientModalFormProps) {
  const [formValues, setFormValues] = useState<ClientFormPayload>(() =>
    getInitialFormValues(clientToEdit),
  );
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (payload: ClientFormPayload) => {
      if (clientToEdit) {
        return clientsService.updateClient(clientToEdit.id, payload);
      }

      return clientsService.createClient(payload);
    },
    onSuccess: (client) => {
      upsertClientCaches(queryClient, client);
      toast.success(
        clientToEdit ? 'Cliente atualizado com sucesso.' : 'Cliente cadastrado com sucesso.',
      );
      onSuccess?.(client);
      onClose();
    },
    onError: (error) => {
      toast.error(
        parseApiError(
          error,
          clientToEdit
            ? 'Erro ao atualizar cliente. Tente novamente.'
            : 'Erro ao cadastrar cliente. Tente novamente.',
        ),
      );
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formValues.name.trim()) {
      return;
    }

    mutation.mutate({
      name: formValues.name.trim(),
      phone: formValues.phone?.trim() || null,
      address: formValues.address?.trim() || null,
    });
  };

  return (
    <div className="relative flex flex-col">
      <button
        onClick={onClose}
        className="group absolute right-6 top-6 z-20 rounded-xl border border-border-subtle bg-secondary/10 p-2.5 text-text-secondary shadow-lg transition-all hover:bg-secondary/20 hover:text-text-primary"
        title="Fechar"
      >
        <X size={20} className="transition-transform duration-300 group-hover:rotate-90" />
      </button>

      <div className="my-4 mx-auto h-1.5 w-12 shrink-0 rounded-full bg-border-subtle sm:hidden" />

      <div className="shrink-0 px-8 pt-8 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-icon-info/10 bg-icon-info/10 font-black text-icon-info shadow-inner">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black leading-none tracking-tighter text-text-primary sm:text-2xl">
              {clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary opacity-70 sm:text-xs">
              Base de Dados
            </p>
          </div>
        </div>
      </div>

      <div className="px-8 pb-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="pl-1 text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Nome Completo
            </label>
            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-icon-brand">
                <User size={18} />
              </div>
              <input
                value={formValues.name}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                required
                className="w-full rounded-xl border border-border-subtle bg-background/50 py-3 pl-12 pr-4 font-medium text-text-primary transition-all placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
                placeholder="Ex: Pastelaria do Jhow"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="pl-1 text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Telefone (opcional)
            </label>
            <div className="group relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary transition-colors group-focus-within:text-icon-brand">
                <Phone size={18} />
              </div>
              <input
                type="tel"
                value={formValues.phone || ''}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-border-subtle bg-background/50 py-3 pl-12 pr-4 font-medium text-text-primary transition-all placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="pl-1 text-[10px] font-black uppercase tracking-widest text-text-secondary">
              Endereço/Ponto de Referência (opcional)
            </label>
            <div className="group relative">
              <div className="absolute left-4 top-4 text-text-secondary transition-colors group-focus-within:text-icon-brand">
                <MapPin size={18} />
              </div>
              <textarea
                value={formValues.address || ''}
                onChange={(event) =>
                  setFormValues((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                rows={2}
                className="w-full resize-none rounded-xl border border-border-subtle bg-background/50 py-3 pl-12 pr-4 font-medium text-text-primary transition-all placeholder:text-text-muted focus:border-primary/50 focus:outline-none"
                placeholder="Rua Exemplo, 123..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="group mt-4 flex w-full items-center justify-center gap-3 rounded-xl bg-button-primary py-4 text-base font-black text-button-primary-foreground shadow-lg shadow-button-shadow transition-all active:scale-[0.98] hover:bg-button-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            {mutation.isPending ? (
              <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-primary-foreground/30 border-t-primary-foreground" />
            ) : (
              <>
                {clientToEdit ? 'Salvar Alterações' : 'Cadastrar Cliente'}
                <CheckCircle2 size={24} className="transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export function ClientModal({
  isOpen,
  onClose,
  onSuccess,
  clientToEdit,
}: ClientModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100%-2rem)] max-w-md gap-0 overflow-hidden border-border bg-modal-background p-0 shadow-2xl sm:rounded-[2.5rem]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            {clientToEdit ? 'Editar Cliente' : 'Cadastrar Cliente'}
          </DialogTitle>
          <DialogDescription>
            {clientToEdit
              ? 'Altere os dados do cliente.'
              : 'Adicione um novo cliente à sua base.'}
          </DialogDescription>
        </DialogHeader>

        <ClientModalForm
          key={`${clientToEdit?.id ?? 'new'}:${isOpen ? 'open' : 'closed'}`}
          onClose={onClose}
          onSuccess={onSuccess}
          clientToEdit={clientToEdit}
        />
      </DialogContent>
    </Dialog>
  );
}
