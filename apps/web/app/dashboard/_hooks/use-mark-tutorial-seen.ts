'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { markAuthTutorialSeen } from '@/hooks/auth/mark-auth-tutorial-seen';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/api-error';
import { settingsService } from '@/services/settings-service';

interface UseMarkTutorialSeenOptions {
  onError?: () => void;
  onSuccess?: () => void;
}

export function useMarkTutorialSeen({
  onError,
  onSuccess,
}: UseMarkTutorialSeenOptions = {}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: () => settingsService.markTutorialSeen(),
    onSuccess: () => {
      markAuthTutorialSeen(queryClient);
      onSuccess?.();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar tutorial',
        description: parseApiError(error, 'Tente novamente.'),
        variant: 'destructive',
      });
      onError?.();
    },
  });

  return {
    markTutorialSeen: mutation.mutate,
    isMarkingTutorialSeen: mutation.isPending,
  };
}
