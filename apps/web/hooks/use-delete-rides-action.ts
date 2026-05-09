'use client';

import { toast } from 'sonner';
import { useDeleteRidesMutation } from '@/hooks/mutations/use-delete-rides-mutation';
import { parseApiError } from '@/lib/api-error';
import type { BulkDeleteRidesResult, RideViewModel } from '@/types/rides';

interface UseDeleteRidesActionOptions {
  successLabel?: {
    singular: string;
    plural: (count: number) => string;
  };
  errorMessage?: string;
}

const DEFAULT_SUCCESS_LABEL = {
  singular: '1 corrida excluida com sucesso.',
  plural: (count: number) => `${count} corridas excluidas com sucesso.`,
};

export function useDeleteRidesAction(options?: UseDeleteRidesActionOptions) {
  const deleteRidesMutation = useDeleteRidesMutation({
    onSuccess: async (result) => {
      const deletedLabel =
        result.deletedCount === 1
          ? (options?.successLabel?.singular ?? DEFAULT_SUCCESS_LABEL.singular)
          : (options?.successLabel?.plural ?? DEFAULT_SUCCESS_LABEL.plural)(
              result.deletedCount,
            );

      toast.success(deletedLabel);
    },
    onError: async (error) => {
      toast.error(
        parseApiError(
          error,
          options?.errorMessage ?? 'Erro ao excluir corridas.',
        ),
      );
    },
  });

  return {
    isDeletingRides: deleteRidesMutation.isPending,
    deleteRides: async (
      rides: RideViewModel[],
    ): Promise<
      | { success: true; result: BulkDeleteRidesResult }
      | { success: false }
    > => {
      try {
        const result = await deleteRidesMutation.mutateAsync(rides);
        return { success: true, result };
      } catch {
        return { success: false };
      }
    },
  };
}
