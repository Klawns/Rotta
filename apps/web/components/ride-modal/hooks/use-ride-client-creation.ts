'use client';

import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { useCreateClientMutation } from '@/hooks/mutations/use-create-client-mutation';

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
  const mutation = useCreateClientMutation({
    onSuccess: async (client) => {
      setSelectedClientId(client.id);
      setNewClientName('');
      setCurrentStep(2);
      toast.success('Cliente cadastrado com sucesso');
    },
    onError: async (error) => {
      toast.error(parseApiError(error, 'Erro ao cadastrar cliente. Tente novamente.'));
    },
  });

  return {
    isSubmittingClient: mutation.isPending,
    handleCreateClient: async () => {
      if (!newClientName.trim()) {
        return;
      }

      await mutation.mutateAsync({
        name: newClientName.trim(),
      });
    },
  };
}
