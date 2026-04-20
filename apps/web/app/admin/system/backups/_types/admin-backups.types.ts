import type {
  BackupJobSummary,
  SystemBackupSettingsResponse,
  UpdateSystemBackupSettingsInput,
} from '@/types/backups';

export type BackupJobSummaryDto = BackupJobSummary;
export type SystemBackupSettingsDto = SystemBackupSettingsResponse;
export type UpdateSystemBackupSettingsDto = UpdateSystemBackupSettingsInput;

export type BackupStatusTone = 'success' | 'warning' | 'danger' | 'muted';

export interface BackupStatusViewModel {
  label: string;
  tone: BackupStatusTone;
}

export interface BackupListItemViewModel {
  id: string;
  createdAtLabel: string;
  createdAtRelativeLabel: string;
  sourceLabel: string;
  sizeLabel: string;
  fileNameLabel: string;
  checksumLabel: string;
  checksumTitle: string | null;
  manifestLabel: string;
  startedAtLabel: string;
  finishedAtLabel: string;
  warningMessage: string | null;
  errorMessage: string | null;
  status: BackupStatusViewModel;
  canDownload: boolean;
}

export interface BackupHeaderViewModel {
  title: string;
  description: string;
}

export interface BackupSettingsSummaryViewModel {
  providerLabel: string;
  schedulerLabel: string;
  scheduleSummary: string;
  retentionSummary: string;
  lastSyncedLabel: string;
  failoverNotice: string | null;
  failoverDetails: string | null;
  environmentNotice: string | null;
  isEnabled: boolean;
}

export interface BackupSettingsFormValues {
  scheduleMode: UpdateSystemBackupSettingsDto['schedule']['mode'];
  fixedTime: string;
  intervalMinutes: string;
  retentionMode: UpdateSystemBackupSettingsDto['retention']['mode'];
  maxCount: string;
  maxAgeDays: string;
}

export interface BackupSettingsFormErrors {
  fixedTime?: string;
  intervalMinutes?: string;
  maxCount?: string;
  maxAgeDays?: string;
}
