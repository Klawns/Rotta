"use client";

import { BackupHistorySection } from "./backup-history-section";
import { BackupRestoreSection } from "./backup-restore-section";
import { BackupsOverviewSection } from "./backups-overview-section";
import { useBackupHistoryFeed } from "../../_hooks/use-backup-history-feed";
import { useBackupRestoreFlow } from "../../_hooks/use-backup-restore-flow";
import { useBackupsPageData } from "../../_hooks/use-backups-page-data";

export function BackupsPageContent() {
  const pageData = useBackupsPageData();
  const historyFeed = useBackupHistoryFeed(pageData.backups);
  const restoreFlow = useBackupRestoreFlow();

  return (
    <div className="space-y-8 pt-1">
      <BackupsOverviewSection
        latestBackupAt={pageData.latestSuccessfulBackup?.createdAt ?? null}
        retentionCount={pageData.backupStatus?.retentionCount ?? 7}
        isCreating={pageData.isCreatingBackup}
        isAutomationActive={
          pageData.backupStatus?.automation.automationEnabled ?? false
        }
        functionalCron={pageData.backupStatus?.automation.functionalCron}
        isLoading={pageData.isLoading || pageData.isStatusLoading}
        onCreate={() => void pageData.createManualBackup()}
      />

      <BackupHistorySection
        backups={historyFeed.backups}
        visibleBackups={historyFeed.visibleBackups}
        hasMore={historyFeed.hasMore}
        isLoading={historyFeed.isLoading}
        error={historyFeed.error}
        downloadState={historyFeed.downloadState}
        isPreparingDownload={historyFeed.isPreparingDownload}
        onLoadMore={historyFeed.loadMore}
        onDownload={historyFeed.startDownload}
        onRetry={() => void historyFeed.retry()}
      />

      <BackupRestoreSection
        preview={restoreFlow.previewResult}
        isPreviewing={restoreFlow.isPreviewingImport}
        isExecuting={restoreFlow.isExecutingImport}
        onPreview={restoreFlow.previewImport}
        onExecute={restoreFlow.executeImport}
        onReset={restoreFlow.resetFlow}
      />
    </div>
  );
}
