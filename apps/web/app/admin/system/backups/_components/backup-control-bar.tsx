'use client';

import { AlertCircle, Loader2, Plus, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type {
  BackupSettingsSummaryViewModel,
  SystemBackupSettingsDto,
  UpdateSystemBackupSettingsDto,
} from '../_types/admin-backups.types';
import { BackupSettingsOverlay } from './backup-settings-overlay';

interface BackupControlBarProps {
  settings: SystemBackupSettingsDto | null;
  settingsSummary: BackupSettingsSummaryViewModel | null;
  isSettingsLoading: boolean;
  settingsError: unknown;
  isRefreshing: boolean;
  isCreating: boolean;
  isSavingSettings: boolean;
  onCreate: () => void;
  onRefresh: () => void;
  onRetrySettings: () => void;
  onSaveSettings: (input: UpdateSystemBackupSettingsDto) => Promise<unknown>;
}

export function BackupControlBar({
  settings,
  settingsSummary,
  isSettingsLoading,
  settingsError,
  isRefreshing,
  isCreating,
  isSavingSettings,
  onCreate,
  onRefresh,
  onRetrySettings,
  onSaveSettings,
}: BackupControlBarProps) {
  const isCreateDisabled = isCreating || settingsSummary?.isEnabled === false;

  return (
    <Card>
      <CardContent className="space-y-4 py-5">
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={onCreate} disabled={isCreateDisabled}>
            {isCreating ? <Loader2 className="animate-spin" /> : <Plus />}
            {isCreating ? 'Enfileirando...' : 'Criar backup agora'}
          </Button>

          <Button variant="outline" onClick={onRefresh} disabled={isRefreshing}>
            {isRefreshing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
            {isRefreshing ? 'Atualizando...' : 'Atualizar dados'}
          </Button>

          <BackupSettingsOverlay
            settings={settings}
            settingsSummary={settingsSummary}
            isLoading={isSettingsLoading}
            error={settingsError}
            isSaving={isSavingSettings}
            onRetry={onRetrySettings}
            onSave={onSaveSettings}
          />
        </div>

        {settingsSummary?.environmentNotice ? (
          <Alert className="border-warning/30 bg-warning/5 text-warning [&>svg]:text-warning">
            <AlertCircle className="size-4" />
            <AlertTitle>Criação manual bloqueada</AlertTitle>
            <AlertDescription>{settingsSummary.environmentNotice}</AlertDescription>
          </Alert>
        ) : null}

        {settingsSummary?.failoverNotice ? (
          <Alert className="border-warning/30 bg-warning/5 text-warning [&>svg]:text-warning">
            <AlertCircle className="size-4" />
            <AlertTitle>Failover recente</AlertTitle>
            <AlertDescription>{settingsSummary.failoverNotice}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
