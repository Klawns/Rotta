'use client';

import { useQuery } from '@tanstack/react-query';
import { useBackupDownload } from '@/hooks/use-backup-download';
import { shouldPollBackupJobs } from '@/lib/backup-query-state';
import { settingsKeys } from '@/lib/query-keys';
import functionalBackupsService from '@/services/functional-backups.service';
import type { BackupJobSummary } from '@/types/backups';
import { useBackupHistoryList } from './use-backup-history-list';

export function useBackupHistoryFeed(
  initialBackups: BackupJobSummary[],
  enabled = true,
) {
  const backupsQuery = useQuery({
    queryKey: settingsKeys.backups(),
    enabled,
    initialData: initialBackups,
    queryFn: ({ signal }) => functionalBackupsService.listBackups(signal),
    refetchInterval: (query) => {
      return shouldPollBackupJobs(query.state.data) ? 3000 : false;
    },
    refetchIntervalInBackground: true,
  });

  const backups = backupsQuery.data ?? initialBackups;
  const { visibleBackups, hasMore, loadMore } = useBackupHistoryList(backups);
  const { downloadState, isPreparingDownload, startDownload } =
    useBackupDownload({
      requestDownloadUrl: (backupId) =>
        functionalBackupsService.getDownloadUrl(backupId),
      successTitle: 'Download iniciado',
      successDescription: 'O navegador ja iniciou a transferencia do backup.',
      errorTitle: 'Falha ao baixar backup',
      errorDescription:
        'Nao foi possivel preparar o download do backup. Tente novamente.',
    });

  return {
    backups,
    visibleBackups,
    hasMore,
    loadMore,
    downloadState,
    isPreparingDownload,
    startDownload,
    isLoading: backupsQuery.isLoading,
    error: backupsQuery.error,
    retry: () => backupsQuery.refetch(),
  };
}
