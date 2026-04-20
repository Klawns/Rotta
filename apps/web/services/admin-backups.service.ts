import { apiClient } from '@/services/api';
import type {
  BackupDownloadResponse,
  BackupJobSummary,
  SystemBackupSettingsResponse,
  UpdateSystemBackupSettingsInput,
} from '@/types/backups';

export const adminBackupsService = {
  async listTechnicalBackups(signal?: AbortSignal): Promise<BackupJobSummary[]> {
    return apiClient.get<BackupJobSummary[]>('/admin/backups/technical', {
      signal,
    });
  },

  async createManualTechnicalBackup(): Promise<BackupJobSummary> {
    return apiClient.post<BackupJobSummary>('/admin/backups/technical/manual');
  },

  async getTechnicalDownloadUrl(
    backupId: string,
  ): Promise<BackupDownloadResponse> {
    return apiClient.get<BackupDownloadResponse>(
      `/admin/backups/technical/${backupId}/download`,
    );
  },

  async getSystemBackupSettings(
    signal?: AbortSignal,
  ): Promise<SystemBackupSettingsResponse> {
    return apiClient.get<SystemBackupSettingsResponse>(
      '/admin/backups/system/settings',
      { signal },
    );
  },

  async updateSystemBackupSettings(
    data: UpdateSystemBackupSettingsInput,
  ): Promise<SystemBackupSettingsResponse> {
    return apiClient.put<SystemBackupSettingsResponse>(
      '/admin/backups/system/settings',
      data,
    );
  },
};

export default adminBackupsService;
