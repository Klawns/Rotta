'use client';

import { useToast } from '@/hooks/use-toast';
import { useDeleteRideMutation } from '@/hooks/mutations/use-delete-ride-mutation';
import { parseApiError } from '@/lib/api-error';

interface UseDeleteDashboardRideProps {
  onDeleted?: () => void;
  onSuccess?: () => void;
}

export function useDeleteDashboardRide({
  onDeleted,
  onSuccess,
}: UseDeleteDashboardRideProps = {}) {
  const { toast } = useToast();
  const mutation = useDeleteRideMutation({
    onSuccess: async () => {
      toast({ title: 'Corrida excluida com sucesso' });
      onSuccess?.();
      onDeleted?.();
    },
    onError: async (error) => {
      toast({
        title: parseApiError(error, 'Erro ao excluir corrida'),
        variant: 'destructive',
      });
    },
  });

  return {
    deleteRide: mutation.mutate,
    isDeletingRide: mutation.isPending,
  };
}
