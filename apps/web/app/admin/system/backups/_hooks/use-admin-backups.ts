'use client';

import { useMemo } from 'react';
import { useBackupDownload } from '@/hooks/use-backup-download';
import { parseApiError } from '@/lib/api-error';
import { adminBackupsService } from '@/services/admin-backups.service';
import type { BackupJobSummaryDto } from '../_types/admin-backups.types';
import { getAdminBackupsHeaderViewModel } from '../_presenters/admin-backups-header.presenter';
import { getBackupItemViewModel } from '../_presenters/backup-item.presenter';
import { getBackupSettingsSummaryViewModel } from '../_presenters/backup-settings.presenter';
import { useAdminBackupSettingsQuery } from './use-admin-backup-settings-query';
import { useAdminTechnicalBackupsQuery } from './use-admin-technical-backups-query';
import { useCreateAdminBackup } from './use-create-admin-backup';
import { useUpdateAdminBackupSettings } from './use-update-admin-backup-settings';

const EMPTY_BACKUPS: BackupJobSummaryDto[] = [];

export function useAdminBackups() {
  const backupsQuery = useAdminTechnicalBackupsQuery();
  const settingsQuery = useAdminBackupSettingsQuery();
  const createBackupMutation = useCreateAdminBackup();
  const updateSettingsMutation = useUpdateAdminBackupSettings();

  const backups = backupsQuery.data ?? EMPTY_BACKUPS;
  const settings = settingsQuery.data ?? null;

  const backupItems = useMemo(
    () => backups.map((backup) => getBackupItemViewModel(backup)),
    [backups],
  );

  const header = useMemo(() => getAdminBackupsHeaderViewModel(), []);

  const settingsSummary = useMemo(() => {
    if (!settings) {
      return null;
    }

    return getBackupSettingsSummaryViewModel(settings);
  }, [settings]);

  const {
    downloadState,
    isPreparingDownload,
    isDownloadActive,
    startDownload,
  } = useBackupDownload({
    requestDownloadUrl: (backupId) =>
      adminBackupsService.getTechnicalDownloadUrl(backupId),
    successTitle: 'Download iniciado',
    successDescription: 'O navegador ja iniciou a transferencia do dump tecnico.',
    errorTitle: 'Falha ao baixar dump tecnico',
    errorDescription:
      'Nao foi possivel preparar o download do dump tecnico. Tente novamente.',
  });

  return {
    header,
    backups,
    backupItems,
    settings,
    settingsSummary,
    backupsQuery: {
      isLoading: backupsQuery.isLoading,
      isFetching: backupsQuery.isFetching,
      error: backupsQuery.error,
      errorMessage: backupsQuery.isError
        ? parseApiError(
            backupsQuery.error,
            'Nao foi possivel carregar o historico de backups tecnicos.',
          )
        : null,
      refetch: backupsQuery.refetch,
    },
    settingsQuery: {
      isLoading: settingsQuery.isLoading,
      isFetching: settingsQuery.isFetching,
      error: settingsQuery.error,
      errorMessage: settingsQuery.isError
        ? parseApiError(
            settingsQuery.error,
            'Nao foi possivel carregar a configuracao do backup sistemico.',
          )
        : null,
      refetch: settingsQuery.refetch,
    },
    createBackup: {
      isPending: createBackupMutation.isPending,
      mutateAsync: () => createBackupMutation.mutateAsync(),
    },
    updateSettings: {
      isPending: updateSettingsMutation.isPending,
      mutateAsync: updateSettingsMutation.mutateAsync,
    },
    refresh: async () => {
      await Promise.all([backupsQuery.refetch(), settingsQuery.refetch()]);
    },
    download: {
      state: downloadState,
      isPreparingDownload,
      isDownloadActive,
      startDownload,
    },
  };
}
