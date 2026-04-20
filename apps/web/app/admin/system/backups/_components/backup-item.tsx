'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, CircleAlert, TriangleAlert } from 'lucide-react';
import { BackupDownloadInlineStatus } from '@/components/backup-download-inline-status';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { BackupDownloadState } from '@/hooks/use-backup-download';
import { cn } from '@/lib/utils';
import type { BackupListItemViewModel } from '../_types/admin-backups.types';
import { BackupItemActions } from './backup-item-actions';

interface BackupItemProps {
  backup: BackupListItemViewModel;
  downloadState: BackupDownloadState;
  isPreparingDownload: boolean;
  isDownloadActive: (backupId: string) => boolean;
  onDownload: (backupId: string) => void;
}

function getStatusBadgeClassName(
  tone: BackupListItemViewModel['status']['tone'],
) {
  switch (tone) {
    case 'success':
      return 'border-success/20 bg-success/10 text-success';
    case 'warning':
      return 'border-warning/20 bg-warning/10 text-warning';
    case 'danger':
      return 'border-destructive/20 bg-destructive/10 text-destructive';
    case 'muted':
    default:
      return 'border-border bg-muted/40 text-muted-foreground';
  }
}

export function BackupItem({
  backup,
  downloadState,
  isPreparingDownload,
  isDownloadActive,
  onDownload,
}: BackupItemProps) {
  const isFeedbackVisible =
    downloadState.backupId === backup.id && downloadState.phase !== 'idle';
  const [isOpen, setIsOpen] = useState(
    isFeedbackVisible || Boolean(backup.warningMessage || backup.errorMessage),
  );
  const expanded = isOpen || isFeedbackVisible;

  return (
    <Collapsible open={expanded} onOpenChange={setIsOpen}>
      <div className="border-b last:border-b-0">
        <div className="flex items-start gap-3 px-4 py-4 sm:px-6">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="grid flex-1 gap-4 text-left md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto_auto]"
              aria-label={`Expandir detalhes do backup ${backup.id}`}
            >
              <div className="flex min-w-0 items-start gap-3">
                {expanded ? (
                  <ChevronDown className="mt-0.5 size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="mt-0.5 size-4 text-muted-foreground" />
                )}
                <div className="min-w-0 space-y-1">
                  <p className="font-medium text-foreground">{backup.createdAtLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    {backup.createdAtRelativeLabel}
                  </p>
                </div>
              </div>

              <div className="min-w-0 space-y-1">
                <p className="text-sm font-medium text-foreground">{backup.sourceLabel}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {backup.fileNameLabel}
                </p>
              </div>

              <div className="flex items-center justify-start md:justify-end">
                <Badge
                  variant="outline"
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs',
                    getStatusBadgeClassName(backup.status.tone),
                  )}
                >
                  {backup.status.label}
                </Badge>
              </div>

              <div className="text-sm font-medium text-foreground md:text-right">
                {backup.sizeLabel}
              </div>
            </button>
          </CollapsibleTrigger>

          <BackupItemActions
            backupId={backup.id}
            canDownload={backup.canDownload}
            isDownloading={isPreparingDownload && isDownloadActive(backup.id)}
            onDownload={onDownload}
          />
        </div>

        <BackupDownloadInlineStatus
          state={downloadState}
          isVisible={isFeedbackVisible}
          className="px-4 pb-4 sm:px-6"
        />

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="space-y-4 border-t bg-muted/15 px-4 py-4 sm:px-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  ID externo
                </p>
                <p className="break-all font-mono text-sm text-foreground">{backup.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Integridade
                </p>
                <p
                  className="truncate font-mono text-sm text-foreground"
                  title={backup.checksumTitle ?? undefined}
                >
                  {backup.checksumLabel}
                </p>
                <p className="text-xs text-muted-foreground">{backup.manifestLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Inicio
                </p>
                <p className="text-sm text-foreground">{backup.startedAtLabel}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Fim
                </p>
                <p className="text-sm text-foreground">{backup.finishedAtLabel}</p>
              </div>
            </div>

            {backup.warningMessage ? (
              <Alert className="border-warning/30 bg-warning/5 text-warning [&>svg]:text-warning">
                <TriangleAlert />
                <AlertTitle>Fallback registrado</AlertTitle>
                <AlertDescription>{backup.warningMessage}</AlertDescription>
              </Alert>
            ) : null}

            {backup.errorMessage ? (
              <Alert
                variant="destructive"
                className="border-destructive/30 bg-destructive/5"
              >
                <CircleAlert />
                <AlertTitle>Falha do backup</AlertTitle>
                <AlertDescription>{backup.errorMessage}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
