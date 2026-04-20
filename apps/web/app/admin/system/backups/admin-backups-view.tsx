'use client';

import { AdminPage } from '@/app/admin/_components/admin-ui';
import { BackupControlBar } from './_components/backup-control-bar';
import { BackupPageHeader } from './_components/backup-page-header';
import { BackupListSection } from './_components/backup-list-section';
import { useAdminBackups } from './_hooks/use-admin-backups';
import { useBackupListState } from './_hooks/use-backup-list-state';

export function AdminBackupsView() {
  const {
    backups,
    backupItems,
    settings,
    settingsSummary,
    header,
    backupsQuery,
    settingsQuery,
    createBackup,
    updateSettings,
    refresh,
    download,
  } = useAdminBackups();
  const listState = useBackupListState({
    backups: backupItems,
    rawBackups: backups.map((backup) => ({
      id: backup.id,
      status: backup.status,
      trigger: backup.trigger,
    })),
  });

  return (
    <AdminPage className="space-y-8">
      <BackupPageHeader header={header} />

      <BackupControlBar
        settings={settings}
        settingsSummary={settingsSummary}
        isSettingsLoading={settingsQuery.isLoading}
        settingsError={settingsQuery.error}
        isRefreshing={backupsQuery.isFetching || settingsQuery.isFetching}
        isCreating={createBackup.isPending}
        isSavingSettings={updateSettings.isPending}
        onCreate={() => void createBackup.mutateAsync()}
        onRefresh={() => void refresh()}
        onRetrySettings={() => void settingsQuery.refetch()}
        onSaveSettings={(input) => updateSettings.mutateAsync(input)}
      />

      <BackupListSection
        backups={listState.items}
        totalBackupsCount={backupItems.length}
        filteredCount={listState.filteredCount}
        currentPage={listState.currentPage}
        totalPages={listState.totalPages}
        hasPagination={listState.hasPagination}
        statusFilter={listState.statusFilter}
        sourceFilter={listState.sourceFilter}
        statusFilterOptions={listState.statusFilterOptions}
        sourceFilterOptions={listState.sourceFilterOptions}
        isLoading={backupsQuery.isLoading}
        error={backupsQuery.error}
        onRetry={() => void backupsQuery.refetch()}
        onStatusFilterChange={listState.setStatusFilter}
        onSourceFilterChange={listState.setSourceFilter}
        onPreviousPage={listState.goToPreviousPage}
        onNextPage={listState.goToNextPage}
        downloadState={download.state}
        isPreparingDownload={download.isPreparingDownload}
        isDownloadActive={download.isDownloadActive}
        onDownload={download.startDownload}
      />
    </AdminPage>
  );
}
