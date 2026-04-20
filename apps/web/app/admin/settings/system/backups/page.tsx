'use client';

import { AdminPage, AdminPageHeader } from '@/app/admin/_components/admin-ui';
import { TechnicalBackupsPanel } from './_components/technical-backups-panel';
import { useAdminBackups } from './_hooks/use-admin-backups';

export default function AdminBackupsPage() {
  const {
    backups,
    systemSettings,
    isLoading,
    isSettingsLoading,
    errorMessage,
    settingsErrorMessage,
    isCreating,
    isSavingSettings,
    backupDownloadState,
    isPreparingDownload,
    isDownloadActive,
    createTechnicalBackup,
    saveSystemBackupSettings,
    openDownloadUrl,
  } = useAdminBackups();

  return (
    <AdminPage>
      <AdminPageHeader
        badge="Sistema"
        title="Backups tecnicos"
        description="Painel operacional para dumps tecnicos e configuracoes de retencao."
      />

      <TechnicalBackupsPanel
        backups={backups}
        systemSettings={systemSettings}
        isLoading={isLoading}
        isSettingsLoading={isSettingsLoading}
        errorMessage={errorMessage}
        settingsErrorMessage={settingsErrorMessage}
        isCreating={isCreating}
        isSavingSettings={isSavingSettings}
        downloadState={backupDownloadState}
        isPreparingDownload={isPreparingDownload}
        isDownloadActive={isDownloadActive}
        onCreate={() => void createTechnicalBackup()}
        onSaveSettings={(input) => void saveSystemBackupSettings(input)}
        onDownload={openDownloadUrl}
      />
    </AdminPage>
  );
}
