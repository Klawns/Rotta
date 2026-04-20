'use client';

import { Button } from '@/components/ui/button';
import type { BackupDownloadState } from '@/hooks/use-backup-download';
import type { BackupListItemViewModel } from '../_types/admin-backups.types';
import { BackupItem } from './backup-item';

interface BackupListProps {
  backups: BackupListItemViewModel[];
  downloadState: BackupDownloadState;
  isPreparingDownload: boolean;
  isDownloadActive: (backupId: string) => boolean;
  currentPage: number;
  totalPages: number;
  hasPagination: boolean;
  onDownload: (backupId: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function BackupList({
  backups,
  downloadState,
  isPreparingDownload,
  isDownloadActive,
  currentPage,
  totalPages,
  hasPagination,
  onDownload,
  onPreviousPage,
  onNextPage,
}: BackupListProps) {
  return (
    <div>
      <div>
        {backups.map((backup) => (
          <BackupItem
            key={backup.id}
            backup={backup}
            downloadState={downloadState}
            isPreparingDownload={isPreparingDownload}
            isDownloadActive={isDownloadActive}
            onDownload={onDownload}
          />
        ))}
      </div>

      {hasPagination ? (
        <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-sm text-muted-foreground">
            Pagina <span className="font-medium text-foreground">{currentPage}</span>{' '}
            de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousPage}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNextPage}
              disabled={currentPage === totalPages}
            >
              Proxima
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
