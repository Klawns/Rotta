'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { clientKeys, financeKeys, rideKeys } from '@/lib/query-keys';
import { ridesService } from '@/services/rides-service';
import type { PaymentStatus } from '@/types/rides';

interface RidePaymentTarget {
  id: string;
  paymentStatus?: PaymentStatus;
}

interface RidePaymentUpdateInput {
  id: string;
  nextStatus: PaymentStatus;
}

export function useRidePaymentStatus() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, nextStatus }: RidePaymentUpdateInput) =>
      ridesService.updateRideStatus(id, { paymentStatus: nextStatus }),
    onSuccess: async (_, variables) => {
      toast.success(
        variables.nextStatus === 'PAID'
          ? 'Pagamento marcado como pago'
          : 'Pagamento marcado como pendente',
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: rideKeys.all }),
        queryClient.invalidateQueries({ queryKey: clientKeys.all }),
        queryClient.invalidateQueries({ queryKey: financeKeys.all }),
      ]);
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao atualizar pagamento'));
    },
  });

  const setPaymentStatus = (
    ride: RidePaymentTarget,
    nextStatus: PaymentStatus,
  ) => {
    if (!ride.id || ride.paymentStatus === nextStatus) {
      return Promise.resolve(undefined);
    }

    return mutation.mutateAsync({
      id: ride.id,
      nextStatus,
    });
  };

  const isUpdatingRide = (rideId: string) =>
    mutation.isPending && mutation.variables?.id === rideId;

  return {
    setPaymentStatus,
    isUpdatingRide,
    isPending: mutation.isPending,
  };
}
