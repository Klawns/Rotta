import { StreamableFile } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import type { Response } from 'express';
import { AdminBackupsController } from './admin-backups.controller';
import { BackupsService } from './backups.service';
import { SystemBackupAdminService } from './services/system-backup-admin.service';

describe('AdminBackupsController', () => {
  type BackupSettingsView = {
    providerId: string;
    failover: {
      enabled: boolean;
      fallbackProviderId: string | null;
    };
    schedule: {
      mode: 'fixed_time' | 'interval' | 'disabled';
    };
  };

  type UpdateBackupSettingsPayload = {
    schedule: {
      mode: 'interval';
      fixedTime: null;
      intervalMinutes: number;
    };
    retention: {
      mode: 'max_age';
      maxCount: null;
      maxAgeDays: number;
    };
  };

  let controller: AdminBackupsController;
  let backupsServiceMock: jest.Mocked<BackupsService>;
  let systemBackupAdminServiceMock: jest.Mocked<SystemBackupAdminService>;
  let setHeaderMock: jest.Mock;
  let getTechnicalDownloadFileMock: jest.Mock;
  let getSettingsMock: jest.Mock;
  let updateSettingsMock: jest.Mock;

  beforeEach(() => {
    setHeaderMock = jest.fn();
    getTechnicalDownloadFileMock = jest.fn().mockResolvedValue({
      stream: new PassThrough(),
      fileName: 'technical-backup.sql.gz',
      contentType: 'application/gzip',
    });
    getSettingsMock = jest.fn().mockResolvedValue({
      enabled: true,
      providerId: 'rclone_drive',
      scheduler: {
        health: 'registered',
        lastSyncedAt: '2026-04-17T12:00:00.000Z',
      },
      schedule: {
        mode: 'fixed_time',
        fixedTime: '04:00',
        intervalMinutes: null,
      },
      retention: {
        mode: 'count',
        maxCount: 7,
        maxAgeDays: null,
      },
      failover: {
        enabled: true,
        primaryProviderId: 'rclone_drive',
        fallbackProviderId: 'r2',
        lastFallbackAt: '2026-04-17T12:10:00.000Z',
        lastFallbackBackupId: 'tech-fallback-1',
        lastFallbackReason: 'Falha ao enviar dump para o Google Drive.',
      },
    });
    updateSettingsMock = jest.fn().mockResolvedValue({
      enabled: true,
      providerId: 'rclone_drive',
      scheduler: {
        health: 'registered',
        lastSyncedAt: '2026-04-17T12:05:00.000Z',
      },
      schedule: {
        mode: 'interval',
        fixedTime: null,
        intervalMinutes: 120,
      },
      retention: {
        mode: 'max_age',
        maxCount: null,
        maxAgeDays: 15,
      },
      failover: {
        enabled: true,
        primaryProviderId: 'rclone_drive',
        fallbackProviderId: 'r2',
        lastFallbackAt: '2026-04-17T12:10:00.000Z',
        lastFallbackBackupId: 'tech-fallback-1',
        lastFallbackReason: 'Falha ao enviar dump para o Google Drive.',
      },
    });

    backupsServiceMock = {
      listTechnicalBackups: jest.fn(),
      createManualTechnicalBackup: jest.fn(),
      getTechnicalDownloadUrl: jest.fn(),
      getTechnicalDownloadFile: getTechnicalDownloadFileMock,
    } as unknown as jest.Mocked<BackupsService>;
    systemBackupAdminServiceMock = {
      getSettings: getSettingsMock,
      updateSettings: updateSettingsMock,
    } as unknown as jest.Mocked<SystemBackupAdminService>;

    controller = new AdminBackupsController(
      backupsServiceMock,
      systemBackupAdminServiceMock,
    );
  });

  it('returns a streamable proxy file for technical backup downloads', async () => {
    const response = {
      setHeader: setHeaderMock,
    } as unknown as Response;

    const result = await controller.getTechnicalDownloadFile(
      'tech-1',
      response,
    );

    expect(getTechnicalDownloadFileMock).toHaveBeenCalledWith('tech-1');
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Content-Type',
      'application/gzip',
    );
    expect(setHeaderMock).toHaveBeenCalledWith(
      'Content-Disposition',
      'attachment; filename="technical-backup.sql.gz"',
    );
    expect(result).toBeInstanceOf(StreamableFile);
  });

  it('returns the persisted system backup settings for the admin page', async () => {
    const result =
      (await controller.getSystemBackupSettings()) as BackupSettingsView;

    expect(getSettingsMock).toHaveBeenCalled();
    expect(result.providerId).toBe('rclone_drive');
    expect(result.failover).toEqual(
      expect.objectContaining({
        enabled: true,
        fallbackProviderId: 'r2',
      }),
    );
    expect(result.schedule.mode).toBe('fixed_time');
  });

  it('updates the persisted system backup settings', async () => {
    const payload: UpdateBackupSettingsPayload = {
      schedule: {
        mode: 'interval',
        fixedTime: null,
        intervalMinutes: 120,
      },
      retention: {
        mode: 'max_age',
        maxCount: null,
        maxAgeDays: 15,
      },
    };

    const result = (await controller.updateSystemBackupSettings(
      payload,
    )) as BackupSettingsView;

    expect(updateSettingsMock).toHaveBeenCalledWith(payload);
    expect(result.schedule.mode).toBe('interval');
  });
});
