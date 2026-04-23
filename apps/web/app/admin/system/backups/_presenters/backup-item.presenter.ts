import { getBackupOriginLabel } from "@/lib/backup-history-presentation";
import {
  formatDisplayDateValue,
  formatRelativeDate,
  normalizeDateValue,
} from "@/lib/date-utils";
import type {
  BackupJobSummaryDto,
  BackupListItemViewModel,
} from "../_types/admin-backups.types";

const backupSizeFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatBackupSize(sizeBytes: number | null) {
  if (sizeBytes === null) {
    return "--";
  }

  return `${backupSizeFormatter.format(sizeBytes / 1024 / 1024)} MB`;
}

function formatBackupTime(value: string | null) {
  const date = normalizeDateValue(value);
  if (!date) {
    return "--";
  }

  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatChecksum(checksum: string | null) {
  if (!checksum) {
    return {
      label: "Checksum indisponível",
      title: null,
    };
  }

  return {
    label: checksum.length > 16 ? `${checksum.slice(0, 16)}...` : checksum,
    title: checksum,
  };
}

function getStatusViewModel(
  status: BackupJobSummaryDto["status"],
): BackupListItemViewModel["status"] {
  switch (status) {
    case "success":
      return {
        label: "Concluído",
        tone: "success",
      };
    case "failed":
      return {
        label: "Falhou",
        tone: "danger",
      };
    case "running":
      return {
        label: "Em processamento",
        tone: "warning",
      };
    case "pending":
    default:
      return {
        label: "Na fila",
        tone: "muted",
      };
  }
}

export function getBackupItemViewModel(
  backup: BackupJobSummaryDto,
): BackupListItemViewModel {
  const checksum = formatChecksum(backup.checksum);

  return {
    id: backup.id,
    createdAtLabel: formatDisplayDateValue(backup.createdAt),
    createdAtRelativeLabel: formatRelativeDate(backup.createdAt),
    sourceLabel: getBackupOriginLabel(backup.trigger),
    sizeLabel: formatBackupSize(backup.sizeBytes),
    fileNameLabel: backup.displayName ?? "Nome padrão",
    checksumLabel: checksum.label,
    checksumTitle: checksum.title,
    manifestLabel: `Manifest v${backup.manifestVersion}`,
    startedAtLabel: formatBackupTime(backup.startedAt),
    finishedAtLabel: formatBackupTime(backup.finishedAt),
    warningMessage: backup.warnings?.[0] ?? null,
    errorMessage: backup.errorMessage,
    status: getStatusViewModel(backup.status),
    canDownload: backup.status === "success",
  };
}
