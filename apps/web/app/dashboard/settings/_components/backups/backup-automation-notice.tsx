'use client';

import type { BackupAutomationStatus } from '@/types/backups';
import { getBackupAutomationNoticeDescription } from '../../_mappers/backup-automation.presenter';

interface BackupAutomationNoticeProps {
  status: BackupAutomationStatus | null;
  isLoading: boolean;
}

export function BackupAutomationNotice({
  status,
  isLoading,
}: BackupAutomationNoticeProps) {
  const description = getBackupAutomationNoticeDescription(status);

  return (
    <div className="rounded-2xl border border-border-subtle bg-card/40 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">
              Configuracoes de Automacao
            </h4>
            {isLoading && (
              <span className="rounded-full border border-border-subtle bg-background/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Carregando...
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
