import { formatDisplayDateValue } from '@/lib/date-utils';
import type { BackupImportJobResponse } from '@/types/backups';

interface BackupRestoreFlowPresentationOptions {
  preview: BackupImportJobResponse | null;
  selectedFileName: string | null;
  isOpen: boolean;
  isExecuting: boolean;
  currentUserId?: string | null;
  currentUserName?: string | null;
}

type BackupRestoreStepState =
  | 'current'
  | 'upcoming'
  | 'complete'
  | 'danger'
  | 'success';

export interface BackupRestoreStepViewModel {
  id: 'upload' | 'review' | 'backup' | 'restore';
  title: string;
  description: string;
  state: BackupRestoreStepState;
}

export interface BackupRestoreFlowPresentation {
  mode: 'idle' | 'validated' | 'running' | 'failed' | 'success';
  isExpanded: boolean;
  canToggle: boolean;
  displayedFileName: string | null;
  ownerDisplayName: string | null;
  createdAtLabel: string | null;
  executeButtonLabel: string;
  executionPhase: BackupImportJobResponse['phase'] | null;
  statusMessage: string | null;
  steps: BackupRestoreStepViewModel[];
}

function getOwnerDisplayName(
  preview: BackupImportJobResponse,
  currentUserId?: string | null,
  currentUserName?: string | null,
) {
  return (
    preview.preview.ownerName?.trim() ||
    (preview.preview.ownerUserId === currentUserId ? currentUserName : null) ||
    'Usuario nao identificado'
  );
}

function getMode(
  preview: BackupImportJobResponse | null,
): BackupRestoreFlowPresentation['mode'] {
  if (!preview) {
    return 'idle';
  }

  return preview.status;
}

function getStatusMessage(
  mode: BackupRestoreFlowPresentation['mode'],
  preview: BackupImportJobResponse | null,
) {
  switch (mode) {
    case 'running':
      return preview?.phase === 'backing_up'
        ? 'Gerando um backup de seguranca antes da restauracao.'
        : 'Aplicando os dados do arquivo no ambiente atual.';
    case 'failed':
      return (
        preview?.errorMessage ||
        'A restauracao falhou. Revise o arquivo e tente novamente.'
      );
    case 'success':
      return 'Restauracao concluida. Os dados ja foram atualizados.';
    default:
      return null;
  }
}

function getSteps(
  mode: BackupRestoreFlowPresentation['mode'],
  preview: BackupImportJobResponse | null,
): BackupRestoreStepViewModel[] {
  const isImportingPhase = preview?.phase === 'importing';

  return [
    {
      id: 'upload',
      title: 'Upload',
      description: 'Escolher o arquivo .zip',
      state: mode === 'idle' ? 'current' : 'complete',
    },
    {
      id: 'review',
      title: 'Revisao',
      description: 'Validar origem e conteudo',
      state:
        mode === 'idle'
          ? 'upcoming'
          : mode === 'validated'
            ? 'current'
            : 'complete',
    },
    {
      id: 'backup',
      title: 'Backup atual',
      description: 'Criar um ponto de seguranca',
      state:
        mode === 'running' && !isImportingPhase
          ? 'current'
          : mode === 'running' && isImportingPhase
            ? 'complete'
            : mode === 'failed' || mode === 'success'
              ? 'complete'
              : 'upcoming',
    },
    {
      id: 'restore',
      title: 'Restauracao',
      description: 'Aplicar o conteudo validado',
      state:
        mode === 'running' && isImportingPhase
          ? 'current'
          : mode === 'failed'
            ? 'danger'
            : mode === 'success'
              ? 'success'
              : 'upcoming',
    },
  ];
}

export function getBackupRestoreFlowPresentation({
  preview,
  selectedFileName,
  isOpen,
  isExecuting,
  currentUserId,
  currentUserName,
}: BackupRestoreFlowPresentationOptions): BackupRestoreFlowPresentation {
  const mode = getMode(preview);
  const executionPhase = preview?.status === 'running' ? preview.phase : null;

  return {
    mode,
    isExpanded: mode === 'running' ? true : isOpen,
    canToggle: mode !== 'running',
    displayedFileName: preview ? selectedFileName : null,
    ownerDisplayName: preview
      ? getOwnerDisplayName(preview, currentUserId, currentUserName)
      : null,
    createdAtLabel: preview
      ? formatDisplayDateValue(preview.preview.createdAt)
      : null,
    executeButtonLabel: !isExecuting
      ? 'Confirmar e restaurar'
      : executionPhase === 'backing_up'
        ? 'Gerando backup de seguranca...'
        : 'Importando dados...',
    executionPhase,
    statusMessage: getStatusMessage(mode, preview),
    steps: getSteps(mode, preview),
  };
}
