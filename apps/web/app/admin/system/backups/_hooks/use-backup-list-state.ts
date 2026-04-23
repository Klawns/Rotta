"use client";

import { useMemo, useState } from "react";
import type { BackupListItemViewModel } from "../_types/admin-backups.types";

export const BACKUP_LIST_ITEMS_PER_PAGE = 8;

export const backupStatusFilterOptions = [
  { value: "all", label: "Todos os status" },
  { value: "success", label: "Concluídos" },
  { value: "failed", label: "Falhas" },
  { value: "pending", label: "Na fila" },
  { value: "running", label: "Em processamento" },
] as const;

export const backupSourceFilterOptions = [
  { value: "all", label: "Todas as origens" },
  { value: "manual", label: "Manual" },
  { value: "scheduled", label: "Automático" },
] as const;

export type BackupStatusFilter =
  (typeof backupStatusFilterOptions)[number]["value"];
export type BackupSourceFilter =
  (typeof backupSourceFilterOptions)[number]["value"];

interface BackupListStateParams {
  backups: BackupListItemViewModel[];
  rawBackups: Array<{
    id: string;
    status: "pending" | "running" | "success" | "failed";
    trigger: "manual" | "scheduled" | "pre_import";
  }>;
}

function isStatusFilter(value: string): value is BackupStatusFilter {
  return backupStatusFilterOptions.some((option) => option.value === value);
}

function isSourceFilter(value: string): value is BackupSourceFilter {
  return backupSourceFilterOptions.some((option) => option.value === value);
}

export function filterBackups(
  params: BackupListStateParams,
  filters: {
    statusFilter: BackupStatusFilter;
    sourceFilter: BackupSourceFilter;
  },
) {
  return params.backups.filter((backup) => {
    const rawBackup = params.rawBackups.find((item) => item.id === backup.id);

    if (!rawBackup) {
      return false;
    }

    const matchesStatus =
      filters.statusFilter === "all" ||
      rawBackup.status === filters.statusFilter;
    const matchesSource =
      filters.sourceFilter === "all" ||
      rawBackup.trigger === filters.sourceFilter;

    return matchesStatus && matchesSource;
  });
}

export function getTotalPages(
  totalItems: number,
  itemsPerPage = BACKUP_LIST_ITEMS_PER_PAGE,
) {
  if (totalItems <= 0) {
    return 1;
  }

  return Math.ceil(totalItems / itemsPerPage);
}

export function clampPage(page: number, totalPages: number) {
  return Math.min(Math.max(page, 1), totalPages);
}

export function paginateBackups(
  backups: BackupListItemViewModel[],
  page: number,
  itemsPerPage = BACKUP_LIST_ITEMS_PER_PAGE,
) {
  const totalPages = getTotalPages(backups.length, itemsPerPage);
  const safePage = clampPage(page, totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;

  return backups.slice(startIndex, startIndex + itemsPerPage);
}

export function useBackupListState(params: BackupListStateParams) {
  const [rawPage, setRawPage] = useState(1);
  const [statusFilter, setStatusFilterValue] =
    useState<BackupStatusFilter>("all");
  const [sourceFilter, setSourceFilterValue] =
    useState<BackupSourceFilter>("all");

  const filteredBackups = useMemo(
    () => filterBackups(params, { statusFilter, sourceFilter }),
    [params, sourceFilter, statusFilter],
  );

  const totalPages = getTotalPages(filteredBackups.length);
  const currentPage = clampPage(rawPage, totalPages);
  const paginatedBackups = useMemo(
    () => paginateBackups(filteredBackups, currentPage),
    [currentPage, filteredBackups],
  );

  const setStatusFilter = (value: string) => {
    if (!isStatusFilter(value)) {
      return;
    }

    setStatusFilterValue(value);
    setRawPage(1);
  };

  const setSourceFilter = (value: string) => {
    if (!isSourceFilter(value)) {
      return;
    }

    setSourceFilterValue(value);
    setRawPage(1);
  };

  return {
    items: paginatedBackups,
    filteredCount: filteredBackups.length,
    currentPage,
    totalPages,
    hasPagination: totalPages > 1,
    statusFilter,
    sourceFilter,
    statusFilterOptions: backupStatusFilterOptions,
    sourceFilterOptions: backupSourceFilterOptions,
    setStatusFilter,
    setSourceFilter,
    goToPreviousPage: () =>
      setRawPage((page) => clampPage(page - 1, totalPages)),
    goToNextPage: () => setRawPage((page) => clampPage(page + 1, totalPages)),
  };
}
