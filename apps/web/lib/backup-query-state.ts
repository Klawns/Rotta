import type {
  BackupImportJobPhase,
  BackupImportPreview,
  BackupImportJobResponse,
  BackupImportJobStatus,
  BackupJobSummary,
} from '@/types/backups';

const ACTIVE_BACKUP_STATUSES = new Set<string>([
  'pending',
  'running',
]);

const BACKUP_JOB_STATUSES = new Set<string>([
  'pending',
  'running',
  'success',
  'failed',
]);

const IMPORT_JOB_STATUSES = new Set<string>([
  'validated',
  'running',
  'success',
  'failed',
]);

const IMPORT_JOB_PHASES = new Set<string>([
  'validated',
  'backing_up',
  'importing',
  'completed',
  'failed',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isBackupJobStatus(
  value: unknown,
): value is BackupJobSummary['status'] {
  return typeof value === 'string' && BACKUP_JOB_STATUSES.has(value);
}

function isImportJobStatus(value: unknown): value is BackupImportJobStatus {
  return typeof value === 'string' && IMPORT_JOB_STATUSES.has(value);
}

function isImportJobPhase(value: unknown): value is BackupImportJobPhase {
  return typeof value === 'string' && IMPORT_JOB_PHASES.has(value);
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isBackupImportPreview(value: unknown): value is BackupImportPreview {
  return (
    isRecord(value) &&
    typeof value.manifestVersion === 'number' &&
    typeof value.ownerUserId === 'string' &&
    isNullableString(value.ownerName) &&
    typeof value.createdAt === 'string' &&
    typeof value.archiveChecksum === 'string' &&
    typeof value.sizeBytes === 'number' &&
    Array.isArray(value.modules) &&
    isRecord(value.counts) &&
    typeof value.counts.clients === 'number' &&
    typeof value.counts.rides === 'number' &&
    typeof value.counts.client_payments === 'number' &&
    typeof value.counts.balance_transactions === 'number' &&
    typeof value.counts.ride_presets === 'number' &&
    isStringArray(value.warnings)
  );
}

function isBackupJobSummary(value: unknown): value is BackupJobSummary {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.kind === 'string' &&
    typeof value.trigger === 'string' &&
    isBackupJobStatus(value.status) &&
    typeof value.manifestVersion === 'number' &&
    typeof value.createdAt === 'string'
  );
}

function isBackupJobPollingCandidate(
  value: unknown,
): value is Pick<BackupJobSummary, 'status'> {
  return isRecord(value) && isBackupJobStatus(value.status);
}

function isImportJobPollingCandidate(
  value: unknown,
): value is Pick<BackupImportJobResponse, 'status'> {
  return isRecord(value) && isImportJobStatus(value.status);
}

export function getBackupJobsFromQueryData(
  value: unknown,
): BackupJobSummary[] | null {
  if (!Array.isArray(value) || !value.every(isBackupJobSummary)) {
    return null;
  }

  return value;
}

export function shouldPollBackupJobs(value: unknown) {
  if (!Array.isArray(value)) {
    return false;
  }

  return value.some(
    (backup) =>
      isBackupJobPollingCandidate(backup) &&
      ACTIVE_BACKUP_STATUSES.has(backup.status),
  );
}

export function getImportJobFromQueryData(
  value: unknown,
): BackupImportJobResponse | null {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    !isImportJobStatus(value.status) ||
    !isImportJobPhase(value.phase) ||
    !isNullableString(value.errorMessage) ||
    !isNullableString(value.createdAt) ||
    !isNullableString(value.startedAt) ||
    !isNullableString(value.finishedAt) ||
    !isBackupImportPreview(value.preview)
  ) {
    return null;
  }

  return {
    id: value.id,
    status: value.status,
    phase: value.phase,
    errorMessage: value.errorMessage,
    createdAt: value.createdAt,
    startedAt: value.startedAt,
    finishedAt: value.finishedAt,
    preview: value.preview,
  };
}

export function shouldPollImportJob(value: unknown) {
  return isImportJobPollingCandidate(value) && value.status === 'running';
}
