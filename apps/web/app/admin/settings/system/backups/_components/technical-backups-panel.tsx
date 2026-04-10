'use client';

import {
  DatabaseBackup,
  Filter,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BackupDownloadState } from '@/hooks/use-backup-download';
import type { BackupJobSummary } from '@/types/backups';
import { useTechnicalBackupsPanel } from '../_hooks/use-technical-backups-panel';
import { TechnicalBackupRow } from './technical-backup-row';

interface TechnicalBackupsPanelProps {
  backups: BackupJobSummary[];
  isLoading: boolean;
  errorMessage: string | null;
  isCreating: boolean;
  downloadState: BackupDownloadState;
  isPreparingDownload: boolean;
  isDownloadActive: (backupId: string) => boolean;
  onCreate: () => void;
  onDownload: (backupId: string) => void;
}

export function TechnicalBackupsPanel({
  backups,
  isLoading,
  errorMessage,
  isCreating,
  downloadState,
  isPreparingDownload,
  isDownloadActive,
  onCreate,
  onDownload,
}: TechnicalBackupsPanelProps) {
  const panel = useTechnicalBackupsPanel(backups);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-border-subtle bg-card/70 p-6 shadow-sm backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="mb-1 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.1em] text-info">
            <ShieldCheck size={14} /> Admin Area
          </div>
          <h1 className="text-xl font-bold text-foreground">
            Dumps Puros (PostgreSQL)
          </h1>
          <p className="text-sm text-muted-foreground">
            Historico e execucao de dumps completos para disaster recovery
            extremo.
          </p>
        </div>

        <Button
          className="bg-primary font-bold text-primary-foreground hover:bg-primary/90"
          disabled={isCreating}
          onClick={onCreate}
        >
          <DatabaseBackup className="mr-2 h-4 w-4" />
          {isCreating ? 'Enfileirando...' : 'Gerar Dump Agora'}
        </Button>
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-border-subtle bg-card/70 shadow-sm backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-border-subtle bg-background/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={panel.statusFilter}
              onChange={(event) => panel.setStatusFilter(event.target.value)}
              className="bg-transparent text-sm font-medium text-foreground focus:outline-none"
              aria-label="Filtrar backups por status"
            >
              {panel.statusFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="text-border-subtle">|</span>
            <select
              value={panel.triggerFilter}
              onChange={(event) => panel.setTriggerFilter(event.target.value)}
              className="bg-transparent text-sm font-medium text-foreground focus:outline-none"
              aria-label="Filtrar backups por origem"
            >
              {panel.triggerFilterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm font-medium text-muted-foreground">
            {panel.filteredCount} registros
          </div>
        </div>

        <div className="p-0">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground animate-pulse">
              Carregando historico tecnico...
            </div>
          ) : errorMessage ? (
            <div className="m-6 rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
              {errorMessage}
            </div>
          ) : panel.filteredCount === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              Nenhum dump compativel com o filtro.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border-subtle">
              <div className="hidden grid-cols-12 gap-4 bg-background/30 px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground md:grid">
                <div className="col-span-3">Data</div>
                <div className="col-span-2">Origem</div>
                <div className="col-span-3">Status</div>
                <div className="col-span-2 text-right">Tamanho</div>
                <div className="col-span-2 text-right">Acoes</div>
              </div>

              {panel.rows.map((backup) => (
                <TechnicalBackupRow
                  key={backup.id}
                  backup={backup}
                  downloadState={downloadState}
                  isPreparingDownload={isPreparingDownload}
                  isDownloadActive={isDownloadActive}
                  onDownload={onDownload}
                />
              ))}
            </div>
          )}
        </div>

        {panel.hasPagination ? (
          <div className="flex items-center justify-between border-t border-border-subtle bg-background/50 px-6 py-4">
            <span className="text-sm text-muted-foreground">
              Pagina{' '}
              <strong className="text-foreground">{panel.currentPage}</strong>{' '}
              de {panel.totalPages}
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-border-subtle hover:bg-hover-accent"
                onClick={panel.goToPreviousPage}
                disabled={panel.currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-border-subtle hover:bg-hover-accent"
                onClick={panel.goToNextPage}
                disabled={panel.currentPage === panel.totalPages}
              >
                Proxima
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
