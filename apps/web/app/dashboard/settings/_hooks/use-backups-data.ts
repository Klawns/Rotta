'use client';

import { useQuery } from '@tanstack/react-query';
import { shouldPollBackupJobs } from '@/lib/backup-query-state';
import { settingsKeys } from '@/lib/query-keys';
import backupsService from '@/services/backups-service';

export function useBackupsData() {
  const backupsQuery = useQuery({
    queryKey: settingsKeys.backups(),
    queryFn: ({ signal }) => backupsService.listUserBackups(signal),
    refetchInterval: (query) => {
      return shouldPollBackupJobs(query.state.data) ? 3000 : false;
    },
    refetchIntervalInBackground: true,
  });

  const backupStatusQuery = useQuery({
    queryKey: settingsKeys.backupsStatus(),
    queryFn: ({ signal }) => backupsService.getUserBackupStatus(signal),
  });

  return {
    backups: backupsQuery.data ?? [],
    backupStatus: backupStatusQuery.data ?? null,
    isLoading: backupsQuery.isLoading,
    isStatusLoading: backupStatusQuery.isLoading,
    isRefreshing: backupsQuery.isFetching,
    refreshBackups: backupsQuery.refetch,
  };
}
