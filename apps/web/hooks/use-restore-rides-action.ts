'use client';

import { toast } from 'sonner';
import { useRestoreRidesMutation } from '@/hooks/mutations/use-restore-rides-mutation';
import { parseApiError } from '@/lib/api-error';
import type { BulkRestoreRidesResult, RideViewModel } from '@/types/rides';

export function useRestoreRidesAction() {
  const restoreRidesMutation = useRestoreRidesMutation({
    onSuccess: async (result) => {
      const restoredLabel =
        result.restoredCount === 1
          ? '1 corrida restaurada com sucesso.'
          : `${result.restoredCount} corridas restauradas com sucesso.`;

      toast.success(restoredLabel);
    },
    onError: async (error) => {
      toast.error(parseApiError(error, 'Erro ao restaurar corridas.'));
    },
  });

  return {
    isRestoringRides: restoreRidesMutation.isPending,
    restoreRides: async (
      rides: RideViewModel[],
    ): Promise<
      | { success: true; result: BulkRestoreRidesResult }
      | { success: false }
    > => {
      try {
        const result = await restoreRidesMutation.mutateAsync(rides);
        return { success: true, result };
      } catch {
        return { success: false };
      }
    },
  };
}
