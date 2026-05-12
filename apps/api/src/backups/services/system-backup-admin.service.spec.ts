import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackupsRepository } from '../backups.repository';
import { BackupStorageRegistryService } from './backup-storage-registry.service';
import { SystemBackupAdminService } from './system-backup-admin.service';
import { SystemBackupRetentionService } from './system-backup-retention.service';
import { SystemBackupSchedulerService } from './system-backup-scheduler.service';
import {
  type SystemBackupSettings,
  SystemBackupSettingsService,
} from './system-backup-settings.service';

type SettingsServiceMock = jest.Mocked<
  Pick<SystemBackupSettingsService, 'getSettings' | 'updateSettings'>
>;
type SchedulerServiceMock = jest.Mocked<
  Pick<SystemBackupSchedulerService, 'getStatus' | 'syncSchedule'>
>;
type RetentionServiceMock = jest.Mocked<
  Pick<SystemBackupRetentionService, 'pruneBackups'>
>;
type StorageRegistryMock = jest.Mocked<
  Pick<BackupStorageRegistryService, 'getActiveProvider'>
>;
type BackupsRepositoryMock = jest.Mocked<
  Pick<BackupsRepository, 'listSuccessfulTechnicalJobs'>
>;

describe('SystemBackupAdminService', () => {
  let loggerLogSpy: jest.SpyInstance;
  const persistedSettings: SystemBackupSettings = {
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
  };
  const updatedSettings: SystemBackupSettings = {
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

  beforeAll(() => {
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterAll(() => {
    loggerLogSpy.mockRestore();
  });

  const createService = () => {
    const settingsService: SettingsServiceMock = {
      getSettings: jest.fn().mockResolvedValue(persistedSettings),
      updateSettings: jest.fn().mockResolvedValue(updatedSettings),
    };
    const schedulerService: SchedulerServiceMock = {
      getStatus: jest.fn().mockReturnValue({
        health: 'registered',
        lastSyncedAt: '2026-04-17T12:00:00.000Z',
      }),
      syncSchedule: jest.fn().mockResolvedValue(undefined),
    };
    const retentionService: RetentionServiceMock = {
      pruneBackups: jest.fn().mockResolvedValue(undefined),
    };
    const storageRegistry: StorageRegistryMock = {
      getActiveProvider: jest.fn().mockReturnValue({
        id: 'rclone_drive',
        upload: jest.fn(),
        uploadStream: jest.fn(),
        download: jest.fn(),
        delete: jest.fn(),
      }),
    };
    const configService = {
      get: jest.fn((key: string, fallback?: unknown) =>
        key === 'PG_DUMP_BACKUP_ENABLED'
          ? 'true'
          : key === 'SYSTEM_BACKUP_FAILOVER_ENABLED'
            ? 'true'
            : key === 'SYSTEM_BACKUP_FALLBACK_PROVIDER'
              ? 'r2'
              : fallback,
      ),
    };
    const backupsRepository: BackupsRepositoryMock = {
      listSuccessfulTechnicalJobs: jest.fn().mockResolvedValue([
        {
          id: 'tech-fallback-1',
          createdAt: new Date('2026-04-17T13:00:00.000Z'),
          metadataJson: JSON.stringify({
            fallbackUsed: true,
            fallbackReason: 'Falha ao enviar dump para o Google Drive.',
          }),
        },
      ]),
    };

    const service = new SystemBackupAdminService(
      settingsService as unknown as SystemBackupSettingsService,
      schedulerService as unknown as SystemBackupSchedulerService,
      retentionService as unknown as SystemBackupRetentionService,
      backupsRepository as unknown as BackupsRepository,
      storageRegistry as unknown as BackupStorageRegistryService,
      configService as unknown as ConfigService,
    );

    return {
      service,
      settingsService,
      schedulerService,
      retentionService,
      storageRegistry,
      backupsRepository,
    };
  };

  it('returns persisted settings together with runtime provider and scheduler status', async () => {
    const { service, storageRegistry, backupsRepository } = createService();
    loggerLogSpy.mockClear();

    const result = await service.getSettings();

    expect(storageRegistry.getActiveProvider).toHaveBeenCalled();
    expect(backupsRepository.listSuccessfulTechnicalJobs).toHaveBeenCalled();
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        context: 'systemBackupAdmin.getSettings:success',
        providerId: 'rclone_drive',
        enabled: true,
      }),
    );
    expect(result.enabled).toBe(true);
    expect(result.providerId).toBe('rclone_drive');
    expect(result.schedule.mode).toBe('fixed_time');
    expect(result.schedule.fixedTime).toBe('04:00');
    expect(result.failover.enabled).toBe(true);
    expect(result.failover.primaryProviderId).toBe('rclone_drive');
    expect(result.failover.fallbackProviderId).toBe('r2');
    expect(result.failover.lastFallbackBackupId).toBe('tech-fallback-1');
    expect(result.failover.lastFallbackReason).toBe(
      'Falha ao enviar dump para o Google Drive.',
    );
  });

  it('reapplies scheduler and retention after updating persisted settings', async () => {
    const { service, settingsService, schedulerService, retentionService } =
      createService();
    loggerLogSpy.mockClear();

    await service.updateSettings({
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
    });

    expect(settingsService.updateSettings).toHaveBeenCalled();
    expect(schedulerService.syncSchedule).toHaveBeenCalledWith({
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
    });
    expect(retentionService.pruneBackups).toHaveBeenCalledWith({
      mode: 'max_age',
      maxAgeDays: 15,
    });
    expect(loggerLogSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        context: 'systemBackupAdmin.updateSettings:success',
        scheduleMode: 'interval',
        retentionMode: 'max_age',
      }),
    );
  });
});
