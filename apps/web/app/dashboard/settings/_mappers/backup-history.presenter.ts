import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { getBackupOriginLabel } from "@/lib/backup-history-presentation";
import { normalizeDateValue } from "@/lib/date-utils";
import type {
  BackupDownloadPhase,
  BackupDownloadState,
} from "@/hooks/use-backup-download";
import type { BackupJobSummary } from "@/types/backups";

interface BackupHistoryStatusPresentation {
  label: string;
  icon: LucideIcon;
  className: string;
}

interface BackupHistoryDownloadPresentation {
  phase: BackupDownloadPhase;
  label: string;
  icon: LucideIcon;
  iconClassName?: string;
  rowToneClassName: string;
  isDisabled: boolean;
  isFeedbackVisible: boolean;
}

export interface BackupHistoryRowPresentation {
  createdAtLabel: string;
  originLabel: string;
  sizeLabel: string;
  status: BackupHistoryStatusPresentation;
  errorLabel: string | null;
  kindLabel: string;
  download: BackupHistoryDownloadPresentation;
}

interface BackupHistoryRowPresentationOptions {
  downloadState: BackupDownloadState;
  isPreparingDownload: boolean;
  now?: Date;
}

const BACKUP_HISTORY_STATUS_MAP: Record<
  BackupJobSummary["status"],
  BackupHistoryStatusPresentation
> = {
  success: {
    label: "Concluído",
    icon: CheckCircle2,
    className: "text-success",
  },
  failed: {
    label: "Falhou",
    icon: AlertCircle,
    className: "text-destructive",
  },
  running: {
    label: "Processando",
    icon: Clock3,
    className: "text-warning",
  },
  pending: {
    label: "Na fila",
    icon: Clock3,
    className: "text-warning",
  },
};

const backupSizeFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function isSameCalendarDay(left: Date, right: Date) {
  return (
    left.getDate() === right.getDate() &&
    left.getMonth() === right.getMonth() &&
    left.getFullYear() === right.getFullYear()
  );
}

export function getBackupHistoryPublicErrorMessage(job: BackupJobSummary) {
  if (job.status !== "failed") {
    return null;
  }

  return job.kind === "technical_full"
    ? "Falha ao processar o backup técnico. Revise a configuração."
    : "Falha ao processar o backup. Revise a configuração.";
}

export function formatBackupHistoryRelativeDate(
  value: unknown,
  now = new Date(),
) {
  const date = normalizeDateValue(value);

  if (!date) {
    return "Data indisponível";
  }

  if (isSameCalendarDay(date, now)) {
    return `Hoje, ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (isSameCalendarDay(date, yesterday)) {
    return `Ontem, ${date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  return date.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatBackupHistorySize(sizeBytes: number | null) {
  if (sizeBytes === null) {
    return "--";
  }

  return `${backupSizeFormatter.format(sizeBytes / 1024 / 1024)} MB`;
}

function getBackupKindLabel(kind: BackupJobSummary["kind"]) {
  switch (kind) {
    case "functional_user":
      return "Backup funcional";
    case "technical_full":
      return "Backup técnico";
    default:
      return kind;
  }
}

function getBackupHistoryDownloadPresentation(
  backup: BackupJobSummary,
  options: BackupHistoryRowPresentationOptions,
): BackupHistoryDownloadPresentation {
  const isCurrentDownload = options.downloadState.backupId === backup.id;
  const phase = isCurrentDownload ? options.downloadState.phase : "idle";

  const rowToneClassName =
    phase === "requesting"
      ? "bg-info/5"
      : phase === "started"
        ? "bg-success/5"
        : phase === "failed"
          ? "bg-destructive/5"
          : "";

  return {
    phase,
    label:
      phase === "requesting"
        ? "Preparando..."
        : phase === "started"
          ? "Iniciado"
          : phase === "failed"
            ? "Tentar novamente"
            : "Baixar",
    icon:
      phase === "requesting"
        ? Loader2
        : phase === "started"
          ? CheckCircle2
          : Download,
    iconClassName:
      phase === "requesting"
        ? "animate-spin"
        : phase === "started"
          ? "text-success"
          : undefined,
    rowToneClassName,
    isDisabled:
      backup.status !== "success" ||
      options.isPreparingDownload ||
      phase === "started",
    isFeedbackVisible: isCurrentDownload && phase !== "idle",
  };
}

export function getBackupHistoryRowPresentation(
  backup: BackupJobSummary,
  options: BackupHistoryRowPresentationOptions,
): BackupHistoryRowPresentation {
  return {
    createdAtLabel: formatBackupHistoryRelativeDate(
      backup.createdAt,
      options.now,
    ),
    originLabel: getBackupOriginLabel(backup.trigger),
    sizeLabel: formatBackupHistorySize(backup.sizeBytes),
    status: BACKUP_HISTORY_STATUS_MAP[backup.status],
    errorLabel: getBackupHistoryPublicErrorMessage(backup),
    kindLabel: getBackupKindLabel(backup.kind),
    download: getBackupHistoryDownloadPresentation(backup, options),
  };
}
