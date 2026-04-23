'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/api-error';
import { settingsKeys } from '@/lib/query-keys';
import backupsService from '@/services/backups-service';

export function useManualBackup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createManualBackupMutation = useMutation({
    mutationFn: () => backupsService.createManualBackup(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: settingsKeys.backups() }),
        queryClient.invalidateQueries({
          queryKey: settingsKeys.backupsStatus(),
        }),
      ]);
      toast({
        title: 'Backup iniciado',
        description: 'A geração do arquivo foi colocada na fila.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Falha ao iniciar backup',
        description: parseApiError(
          error,
          'Não foi possível iniciar o backup agora. Tente novamente em instantes.',
        ),
        variant: 'destructive',
      });
    },
  });

  return {
    isCreatingBackup: createManualBackupMutation.isPending,
    createManualBackup: () => createManualBackupMutation.mutateAsync(),
  };
}
