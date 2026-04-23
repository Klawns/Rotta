import { formatDisplayDateValue } from "@/lib/date-utils";
import type { BackupImportJobResponse } from "@/types/backups";

interface BackupImportCardPresentationOptions {
  preview: BackupImportJobResponse | null;
  selectedFileName: string | null;
  isOpen: boolean;
  isExecuting: boolean;
  currentUserId?: string | null;
  currentUserName?: string | null;
}

export interface BackupImportCardPresentation {
  ownerDisplayName: string | null;
  isExpanded: boolean;
  canToggle: boolean;
  displayedFileName: string | null;
  executionPhase: BackupImportJobResponse["phase"] | null;
  step: 1 | 2 | 3 | 4;
  executeButtonLabel: string;
  createdAtLabel: string | null;
}

function getOwnerDisplayName(
  preview: BackupImportJobResponse,
  currentUserId?: string | null,
  currentUserName?: string | null,
) {
  return (
    preview.preview.ownerName?.trim() ||
    (preview.preview.ownerUserId === currentUserId ? currentUserName : null) ||
    "Usuário não identificado"
  );
}

function getImportExecutionStep(
  preview: BackupImportJobResponse | null,
): 1 | 2 | 3 | 4 {
  if (!preview) {
    return 1;
  }

  if (preview.status !== "running") {
    return 2;
  }

  return preview.phase === "backing_up" ? 3 : 4;
}

export function getBackupImportCardPresentation({
  preview,
  selectedFileName,
  isOpen,
  isExecuting,
  currentUserId,
  currentUserName,
}: BackupImportCardPresentationOptions): BackupImportCardPresentation {
  const executionPhase = preview?.status === "running" ? preview.phase : null;

  return {
    ownerDisplayName: preview
      ? getOwnerDisplayName(preview, currentUserId, currentUserName)
      : null,
    isExpanded: preview?.status === "running" ? true : isOpen,
    canToggle: preview?.status !== "running",
    displayedFileName: preview ? selectedFileName : null,
    executionPhase,
    step: getImportExecutionStep(preview),
    executeButtonLabel: !isExecuting
      ? "Confirmar e Restaurar"
      : executionPhase === "backing_up"
        ? "Gerando backup de seguranca..."
        : "Importando dados...",
    createdAtLabel: preview
      ? formatDisplayDateValue(preview.preview.createdAt)
      : null,
  };
}
