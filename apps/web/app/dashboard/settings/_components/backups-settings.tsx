'use client';

import { BackupAutomationNotice } from './backups/backup-automation-notice';
import { BackupHistoryList } from './backups/backup-history-list';
import { BackupImportCard } from './backups/backup-import-card';
import { BackupSummaryCard } from './backups/backup-summary-card';
import { useBackups } from '../_hooks/use-backups';

export function BackupsSettings() {
  const {
    summaryCardProps,
    historySection,
    automationNoticeProps,
    importCardProps,
  } = useBackups();

  return (
    <div className="space-y-8">
      {/* 1. Header e Metricas Atuais */}
      <BackupSummaryCard {...summaryCardProps} />

      {/* 2. Historico Central */}
      {historySection.isLoading ? (
        <div className="flex h-32 items-center justify-center rounded-[2rem] border border-border-subtle bg-card/70 text-sm font-medium text-muted-foreground shadow-sm backdrop-blur-xl animate-pulse">
          Carregando historico...
        </div>
      ) : (
        <BackupHistoryList {...historySection.listProps} />
      )}

      {/* 3. Configuracoes e Avisos Secundarios */}
      <BackupAutomationNotice {...automationNoticeProps} />

      {/* 4. Zona de Risco */}
      <BackupImportCard {...importCardProps} />
    </div>
  );
}
