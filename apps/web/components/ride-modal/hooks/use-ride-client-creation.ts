'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { upsertClientCaches } from '@/lib/client-cache';
import { rideModalService } from '../services/ride-modal-service';

interface UseRideClientCreationProps {
  newClientName: string;
  setSelectedClientId: (clientId: string) => void;
  setNewClientName: (name: string) => void;
  setCurrentStep: (step: number) => void;
}

export function useRideClientCreation({
  newClientName,
  setSelectedClientId,
  setNewClientName,
  setCurrentStep,
}: UseRideClientCreationProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const trimmedName = newClientName.trim();
      if (!trimmedName) {
        throw new Error('Nome do cliente obrigatorio.');
      }

      return rideModalService.createClient(trimmedName);
    },
    onSuccess: (client) => {
      upsertClientCaches(queryClient, client);
      setSelectedClientId(client.id);
      setNewClientName('');
      setCurrentStep(2);
      toast.success('Cliente cadastrado com sucesso');
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao cadastrar cliente. Tente novamente.'));
    },
  });

  return {
    isSubmittingClient: mutation.isPending,
    handleCreateClient: async () => {
      if (!newClientName.trim()) {
        return;
      }

      await mutation.mutateAsync();
    },
  };
}
