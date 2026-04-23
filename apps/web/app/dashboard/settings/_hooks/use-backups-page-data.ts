'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { getLatestSuccessfulSummaryBackup } from '@/lib/backup-history-presentation';
import { parseApiError } from '@/lib/api-error';
import { settingsKeys } from '@/lib/query-keys';
import functionalBackupsService from '@/services/functional-backups.service';

export function useBackupsPageData() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const backupsQuery = useQuery({
    queryKey: settingsKeys.backups(),
    queryFn: ({ signal }) => functionalBackupsService.listBackups(signal),
  });

  const statusQuery = useQuery({
    queryKey: settingsKeys.backupsStatus(),
    queryFn: ({ signal }) => functionalBackupsService.getStatus(signal),
  });

  const manualBackupMutation = useMutation({
    mutationFn: () => functionalBackupsService.createManualBackup(),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: settingsKeys.backups() }),
        queryClient.invalidateQueries({
          queryKey: settingsKeys.backupsStatus(),
        }),
      ]);

      toast({
        title: 'Backup iniciado',
        description: 'A geracao do arquivo foi colocada na fila.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Falha ao iniciar backup',
        description: parseApiError(
          error,
          'Nao foi possivel iniciar o backup agora. Tente novamente em instantes.',
        ),
        variant: 'destructive',
      });
    },
  });

  const backups = backupsQuery.data ?? [];

  return {
    backups,
    latestSuccessfulBackup: getLatestSuccessfulSummaryBackup(backups),
    backupStatus: statusQuery.data ?? null,
    isLoading: backupsQuery.isLoading,
    isStatusLoading: statusQuery.isLoading,
    error: backupsQuery.error,
    refreshBackups: () => backupsQuery.refetch(),
    isCreatingBackup: manualBackupMutation.isPending,
    createManualBackup: () => manualBackupMutation.mutateAsync(),
  };
}
