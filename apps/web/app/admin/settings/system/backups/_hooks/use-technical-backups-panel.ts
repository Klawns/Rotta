'use client';

import { useMemo, useState } from 'react';
import type { BackupJobSummary } from '@/types/backups';

export const TECHNICAL_BACKUPS_ITEMS_PER_PAGE = 10;

export const technicalBackupsStatusFilterOptions = [
  { value: 'all', label: 'Status: Todos' },
  { value: 'success', label: 'Status: Sucesso' },
  { value: 'failed', label: 'Status: Falha' },
  { value: 'pending', label: 'Status: Pendente' },
  { value: 'running', label: 'Status: Em progresso' },
] as const;

export const technicalBackupsTriggerFilterOptions = [
  { value: 'all', label: 'Origem: Todas' },
  { value: 'manual', label: 'Origem: Manual' },
  { value: 'scheduled', label: 'Origem: Agendada' },
] as const;

export type TechnicalBackupsStatusFilter =
  (typeof technicalBackupsStatusFilterOptions)[number]['value'];
export type TechnicalBackupsTriggerFilter =
  (typeof technicalBackupsTriggerFilterOptions)[number]['value'];

interface TechnicalBackupsFilters {
  statusFilter: TechnicalBackupsStatusFilter;
  triggerFilter: TechnicalBackupsTriggerFilter;
}

function isTechnicalBackupsStatusFilter(
  value: string,
): value is TechnicalBackupsStatusFilter {
  return technicalBackupsStatusFilterOptions.some(
    (option) => option.value === value,
  );
}

function isTechnicalBackupsTriggerFilter(
  value: string,
): value is TechnicalBackupsTriggerFilter {
  return technicalBackupsTriggerFilterOptions.some(
    (option) => option.value === value,
  );
}

export function filterTechnicalBackups(
  backups: BackupJobSummary[],
  filters: TechnicalBackupsFilters,
) {
  return backups.filter((backup) => {
    const matchesStatus =
      filters.statusFilter === 'all' || backup.status === filters.statusFilter;
    const matchesTrigger =
      filters.triggerFilter === 'all' ||
      backup.trigger === filters.triggerFilter;

    return matchesStatus && matchesTrigger;
  });
}

export function getTechnicalBackupsTotalPages(
  totalItems: number,
  itemsPerPage = TECHNICAL_BACKUPS_ITEMS_PER_PAGE,
) {
  if (totalItems <= 0) {
    return 0;
  }

  return Math.ceil(totalItems / itemsPerPage);
}

export function clampTechnicalBackupsPage(
  page: number,
  totalPages: number,
) {
  if (totalPages <= 0) {
    return 1;
  }

  return Math.min(Math.max(page, 1), totalPages);
}

export function paginateTechnicalBackups(
  backups: BackupJobSummary[],
  currentPage: number,
  itemsPerPage = TECHNICAL_BACKUPS_ITEMS_PER_PAGE,
) {
  if (backups.length === 0) {
    return [];
  }

  const safePage = clampTechnicalBackupsPage(
    currentPage,
    getTechnicalBackupsTotalPages(backups.length, itemsPerPage),
  );
  const startIndex = (safePage - 1) * itemsPerPage;

  return backups.slice(startIndex, startIndex + itemsPerPage);
}

export function useTechnicalBackupsPanel(backups: BackupJobSummary[]) {
  const [rawCurrentPage, setRawCurrentPage] = useState(1);
  const [statusFilter, setStatusFilterValue] =
    useState<TechnicalBackupsStatusFilter>('all');
  const [triggerFilter, setTriggerFilterValue] =
    useState<TechnicalBackupsTriggerFilter>('all');

  const filteredBackups = useMemo(
    () =>
      filterTechnicalBackups(backups, {
        statusFilter,
        triggerFilter,
      }),
    [backups, statusFilter, triggerFilter],
  );

  const totalPages = getTechnicalBackupsTotalPages(filteredBackups.length);
  const currentPage = clampTechnicalBackupsPage(rawCurrentPage, totalPages);
  const rows = useMemo(
    () => paginateTechnicalBackups(filteredBackups, currentPage),
    [filteredBackups, currentPage],
  );

  const setStatusFilter = (value: string) => {
    if (!isTechnicalBackupsStatusFilter(value)) {
      return;
    }

    setStatusFilterValue(value);
    setRawCurrentPage(1);
  };

  const setTriggerFilter = (value: string) => {
    if (!isTechnicalBackupsTriggerFilter(value)) {
      return;
    }

    setTriggerFilterValue(value);
    setRawCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setRawCurrentPage(clampTechnicalBackupsPage(page, totalPages));
  };

  return {
    rows,
    filteredCount: filteredBackups.length,
    statusFilter,
    triggerFilter,
    currentPage,
    totalPages,
    hasPagination: totalPages > 1,
    statusFilterOptions: technicalBackupsStatusFilterOptions,
    triggerFilterOptions: technicalBackupsTriggerFilterOptions,
    setStatusFilter,
    setTriggerFilter,
    goToNextPage: () => goToPage(currentPage + 1),
    goToPreviousPage: () => goToPage(currentPage - 1),
  };
}
