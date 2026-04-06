import type { BackupJobSummary } from '@/types/backups';

export function getBackupOriginLabel(trigger: BackupJobSummary['trigger']) {
  const originLabels: Record<BackupJobSummary['trigger'], string> = {
    manual: 'Manual',
    scheduled: 'Automatico',
    pre_import: 'Pre-importacao',
  };

  return originLabels[trigger];
}

export function getLatestSuccessfulSummaryBackup(backups: BackupJobSummary[]) {
  return (
    backups.find(
      (backup) =>
        backup.status === 'success' &&
        (backup.trigger === 'manual' || backup.trigger === 'scheduled'),
    ) ?? null
  );
}
