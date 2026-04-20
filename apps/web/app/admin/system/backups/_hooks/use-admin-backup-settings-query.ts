'use client';

import { useQuery } from '@tanstack/react-query';
import { adminKeys } from '@/lib/query-keys';
import { adminBackupsService } from '@/services/admin-backups.service';

export function useAdminBackupSettingsQuery() {
  return useQuery({
    queryKey: adminKeys.systemBackupSettings(),
    queryFn: ({ signal }) => adminBackupsService.getSystemBackupSettings(signal),
    retry: false,
  });
}
