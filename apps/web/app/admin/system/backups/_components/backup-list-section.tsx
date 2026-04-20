'use client';

import { DatabaseBackup } from 'lucide-react';
import { QueryErrorState } from '@/components/query-error-state';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { BackupDownloadState } from '@/hooks/use-backup-download';
import type { BackupListItemViewModel } from '../_types/admin-backups.types';
import type {
  BackupSourceFilter,
  BackupStatusFilter,
} from '../_hooks/use-backup-list-state';
import { BackupList } from './backup-list';

interface BackupListSectionProps {
  backups: BackupListItemViewModel[];
  totalBackupsCount: number;
  filteredCount: number;
  currentPage: number;
  totalPages: number;
  hasPagination: boolean;
  statusFilter: BackupStatusFilter;
  sourceFilter: BackupSourceFilter;
  statusFilterOptions: ReadonlyArray<{
    value: BackupStatusFilter;
    label: string;
  }>;
  sourceFilterOptions: ReadonlyArray<{
    value: BackupSourceFilter;
    label: string;
  }>;
  isLoading: boolean;
  error: unknown;
  onRetry: () => void;
  onStatusFilterChange: (value: string) => void;
  onSourceFilterChange: (value: string) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
  downloadState: BackupDownloadState;
  isPreparingDownload: boolean;
  isDownloadActive: (backupId: string) => boolean;
  onDownload: (backupId: string) => void;
}

function BackupListSkeleton() {
  return (
    <div className="space-y-3 px-4 py-4 sm:px-6">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function BackupListSection({
  backups,
  totalBackupsCount,
  filteredCount,
  currentPage,
  totalPages,
  hasPagination,
  statusFilter,
  sourceFilter,
  statusFilterOptions,
  sourceFilterOptions,
  isLoading,
  error,
  onRetry,
  onStatusFilterChange,
  onSourceFilterChange,
  onPreviousPage,
  onNextPage,
  downloadState,
  isPreparingDownload,
  isDownloadActive,
  onDownload,
}: BackupListSectionProps) {
  const isFilteredEmpty = totalBackupsCount > 0 && filteredCount === 0;

  return (
    <Card className="gap-0 overflow-hidden">
      <CardHeader className="gap-4 border-b py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Listagem</CardTitle>
            <p className="text-sm text-muted-foreground">
              Consulte o historico, verifique falhas e baixe apenas os dumps concluidos.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full min-w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                {statusFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={onSourceFilterChange}>
              <SelectTrigger className="w-full min-w-48">
                <SelectValue placeholder="Filtrar por origem" />
              </SelectTrigger>
              <SelectContent>
                {sourceFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {filteredCount} registro(s) exibidos de {totalBackupsCount} total.
        </p>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? <BackupListSkeleton /> : null}

        {!isLoading && error ? (
          <div className="px-4 py-6 sm:px-6">
            <QueryErrorState
              error={error}
              title="Nao foi possivel carregar os backups"
              description="O historico tecnico nao foi carregado. Tente novamente."
              onRetry={onRetry}
            />
          </div>
        ) : null}

        {!isLoading && !error && filteredCount === 0 ? (
          <div className="px-4 py-8 sm:px-6">
            <Empty className="border border-dashed">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <DatabaseBackup />
                </EmptyMedia>
                <EmptyTitle>
                  {isFilteredEmpty ? 'Nenhum resultado para os filtros atuais' : 'Nenhum backup tecnico ainda'}
                </EmptyTitle>
                <EmptyDescription>
                  {isFilteredEmpty
                    ? 'Ajuste os filtros para voltar a exibir registros.'
                    : 'Quando um dump tecnico for criado, ele aparecera nesta lista com status e detalhes operacionais.'}
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent />
            </Empty>
          </div>
        ) : null}

        {!isLoading && !error && filteredCount > 0 ? (
          <BackupList
            backups={backups}
            downloadState={downloadState}
            isPreparingDownload={isPreparingDownload}
            isDownloadActive={isDownloadActive}
            currentPage={currentPage}
            totalPages={totalPages}
            hasPagination={hasPagination}
            onDownload={onDownload}
            onPreviousPage={onPreviousPage}
            onNextPage={onNextPage}
          />
        ) : null}
      </CardContent>
    </Card>
  );
}
