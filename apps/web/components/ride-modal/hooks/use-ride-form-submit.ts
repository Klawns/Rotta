'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { authKeys, clientKeys, financeKeys, rideKeys } from '@/lib/query-keys';
import { upsertRideCaches } from '@/lib/ride-cache';
import { type Ride } from '@/types/rides';
import { submitRideDraft } from '../lib/ride-submission';

interface UseRideFormSubmitProps {
  draft: {
    selectedClientId: string;
    value: string;
    location: string;
    notes: string;
    photo: string | null;
    rideDate: string;
    paymentStatus: 'PENDING' | 'PAID';
    useBalance?: boolean;
  };
  rideToEdit?: Ride | null;
  verify: () => Promise<unknown>;
  resetForm: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useRideFormSubmit({
  draft,
  rideToEdit,
  verify,
  resetForm,
  onSuccess,
  onClose,
}: UseRideFormSubmitProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => submitRideDraft(draft, rideToEdit),
    onSuccess: async (ride) => {
      upsertRideCaches(queryClient, ride);

      const affectedClientIds = Array.from(
        new Set(
          [ride.clientId || ride.client?.id, rideToEdit?.clientId || rideToEdit?.client?.id]
            .filter((value): value is string => Boolean(value)),
        ),
      );

      toast.success(rideToEdit ? 'Corrida atualizada' : 'Corrida registrada');

      await Promise.all([
        ...affectedClientIds.flatMap((clientId) => [
          queryClient.invalidateQueries({
            queryKey: clientKeys.detail(clientId),
            exact: true,
          }),
          queryClient.invalidateQueries({
            queryKey: clientKeys.balance(clientId),
            exact: true,
          }),
        ]),
        queryClient.invalidateQueries({ queryKey: rideKeys.frequentClients() }),
        queryClient.invalidateQueries({ queryKey: financeKeys.all }),
        queryClient.invalidateQueries({ queryKey: authKeys.user() }),
      ]);

      await verify();

      if (!rideToEdit) {
        resetForm();
      }

      onSuccess?.();
      onClose?.();
    },
    onError: (error) => {
      toast.error(
        parseApiError(
          error,
          `Erro ao ${rideToEdit ? 'atualizar' : 'registrar'} corrida.`,
        ),
      );
    },
  });

  return {
    isSubmitting: mutation.isPending,
    handleSubmit: async (event?: React.FormEvent | React.MouseEvent) => {
      event?.preventDefault();

      if (!draft.selectedClientId || !draft.value) {
        toast.error('Informe o cliente e o valor da corrida.');
        return;
      }

      await mutation.mutateAsync();
    },
  };
}
