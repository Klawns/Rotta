'use client';

import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { useSubmitRideMutation } from '@/hooks/mutations/use-submit-ride-mutation';
import { type Ride } from '@/types/rides';
import { type RideSubmissionDraft } from '../lib/ride-submission';

interface UseRideFormSubmitProps {
  draft: RideSubmissionDraft;
  rideToEdit?: Ride | null;
  resetForm: () => void;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function useRideFormSubmit({
  draft,
  rideToEdit,
  resetForm,
  onSuccess,
  onClose,
}: UseRideFormSubmitProps) {
  const mutation = useSubmitRideMutation({
    onSuccess: async () => {
      toast.success(rideToEdit ? 'Corrida atualizada' : 'Corrida registrada');

      if (!rideToEdit) {
        resetForm();
      }

      onSuccess?.();
      onClose?.();
    },
    onError: async (error) => {
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

      await mutation.mutateAsync({
        draft,
        rideToEdit,
      });
    },
  };
}
