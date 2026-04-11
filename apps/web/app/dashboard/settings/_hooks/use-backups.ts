'use client';

import { useBackupDownload } from '@/hooks/use-backup-download';
import { getLatestSuccessfulSummaryBackup } from '@/lib/backup-history-presentation';
import backupsService from '@/services/backups-service';
import { useBackupImport } from './use-backup-import';
import { useBackupsData } from './use-backups-data';
import { useManualBackup } from './use-manual-backup';

export function useBackups() {
  const backupsData = useBackupsData();
  const manualBackup = useManualBackup();
  const backupImport = useBackupImport();
  const latestSuccessfulBackup = getLatestSuccessfulSummaryBackup(
    backupsData.backups,
  );

  const { downloadState, isPreparingDownload, startDownload } =
    useBackupDownload({
      requestDownloadUrl: (backupId) => backupsService.getDownloadUrl(backupId),
      successTitle: 'Download iniciado',
      successDescription: 'O navegador ja iniciou a transferencia do backup.',
      errorTitle: 'Falha ao baixar backup',
      errorDescription:
        'Nao foi possivel preparar o download do backup. Tente novamente.',
    });

  return {
    summaryCardProps: {
      retentionCount: backupsData.backupStatus?.retentionCount ?? 7,
      latestBackupAt: latestSuccessfulBackup?.createdAt ?? null,
      isCreating: manualBackup.isCreatingBackup,
      isAutomationActive:
        backupsData.backupStatus?.automation?.automationEnabled ?? false,
      functionalCron: backupsData.backupStatus?.automation?.functionalCron,
      onCreate: () => void manualBackup.createManualBackup(),
    },
    historySection: {
      isLoading: backupsData.isLoading,
      listProps: {
        backups: backupsData.backups,
        downloadState,
        isPreparingDownload,
        onDownload: startDownload,
      },
    },
    automationNoticeProps: {
      status: backupsData.backupStatus,
      isLoading: backupsData.isStatusLoading,
    },
    importCardProps: {
      preview: backupImport.previewResult,
      isPreviewing: backupImport.isPreviewingImport,
      isExecuting: backupImport.isExecutingImport,
      onPreview: backupImport.previewImport,
      onExecute: backupImport.executeImport,
    },
  };
}
