'use client';

import { useQuery } from '@tanstack/react-query';
import { shouldPollBackupJobs } from '@/lib/backup-query-state';
import { adminKeys } from '@/lib/query-keys';
import { adminBackupsService } from '@/services/admin-backups.service';

export function useAdminTechnicalBackupsQuery() {
  return useQuery({
    queryKey: adminKeys.technicalBackups(),
    queryFn: ({ signal }) => adminBackupsService.listTechnicalBackups(signal),
    retry: false,
    refetchInterval: (query) => {
      return shouldPollBackupJobs(query.state.data) ? 3000 : false;
    },
    refetchIntervalInBackground: true,
  });
}
