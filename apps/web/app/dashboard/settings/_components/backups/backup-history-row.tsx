'use client';

import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { BackupDownloadInlineStatus } from '@/components/backup-download-inline-status';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { BackupDownloadState } from '@/hooks/use-backup-download';
import type { BackupJobSummary } from '@/types/backups';
import { getBackupHistoryRowPresentation } from '../../_mappers/backup-history.presenter';

interface BackupHistoryRowProps {
  backup: BackupJobSummary;
  downloadState: BackupDownloadState;
  isPreparingDownload: boolean;
  hasBorder: boolean;
  onDownload: (backupId: string) => void;
}

export function BackupHistoryRow({
  backup,
  downloadState,
  isPreparingDownload,
  hasBorder,
  onDownload,
}: BackupHistoryRowProps) {
  const presentation = getBackupHistoryRowPresentation(backup, {
    downloadState,
    isPreparingDownload,
  });
  const StatusIcon = presentation.status.icon;
  const DownloadIcon = presentation.download.icon;

  return (
    <motion.div
      layout
      transition={{ duration: 0.22, ease: 'easeOut' }}
      className={cn(
        'flex flex-col px-6 py-4 transition-colors duration-300',
        hasBorder && 'border-b border-border-subtle',
        presentation.download.rowToneClassName,
      )}
    >
      <div className="grid gap-4 md:grid-cols-12 md:items-center md:gap-0">
        <div className="col-span-3 flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">
            {presentation.createdAtLabel}
          </span>
        </div>

        <div className="col-span-3 flex flex-row items-center gap-3 md:flex-col md:items-start md:gap-1">
          <span className="rounded-full border border-border-subtle bg-background/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {presentation.originLabel}
          </span>
          <span className="text-sm text-muted-foreground">
            {presentation.sizeLabel}
          </span>
        </div>

        <div className="col-span-3 flex flex-col items-start gap-1">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 text-sm font-medium',
              presentation.status.className,
            )}
          >
            <StatusIcon className="h-4 w-4" />
            {presentation.status.label}
          </span>
          {presentation.errorLabel ? (
            <span className="text-xs text-destructive">
              {presentation.errorLabel}
            </span>
          ) : null}
        </div>

        <div className="col-span-3 flex items-center justify-start gap-2 md:justify-end">
          <Button
            variant="outline"
            size="sm"
            className="border-border-subtle bg-background/50 text-foreground hover:bg-hover-accent"
            disabled={presentation.download.isDisabled}
            onClick={() => onDownload(backup.id)}
          >
            <DownloadIcon
              className={cn(
                'mr-2 h-4 w-4',
                presentation.download.iconClassName,
              )}
            />
            {presentation.download.label}
          </Button>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 space-y-2 p-4 text-sm" align="end">
              <div className="font-semibold">Detalhes Tecnicos</div>
              <div className="grid grid-cols-2 gap-y-1 text-muted-foreground">
                <span>ID do Job:</span>
                <span className="truncate font-mono" title={backup.id}>
                  {backup.id}
                </span>
                <span>Tipo:</span>
                <span>{presentation.kindLabel}</span>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <BackupDownloadInlineStatus
        state={downloadState}
        isVisible={presentation.download.isFeedbackVisible}
        className="mt-3"
      />
    </motion.div>
  );
}
