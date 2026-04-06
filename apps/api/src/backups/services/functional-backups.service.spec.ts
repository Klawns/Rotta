/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Jest mocks are intentionally partial. */
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';
import { BackupsAutomationService } from '../backups-automation.service';
import { BackupsRepository } from '../backups.repository';
import { FunctionalBackupsService } from './functional-backups.service';
import { BackupJobOrchestratorService } from './backup-job-orchestrator.service';

describe('FunctionalBackupsService', () => {
  let service: FunctionalBackupsService;
  let repositoryMock: any;
  let storageProviderMock: any;
  let backupsAutomationServiceMock: any;
  let backupJobOrchestratorServiceMock: any;

  beforeEach(async () => {
    repositoryMock = {
      listUserJobs: jest.fn().mockResolvedValue([]),
      findUserJob: jest.fn(),
    };

    storageProviderMock = {
      getSignedUrl: jest
        .fn()
        .mockResolvedValue('https://signed.example.com/job-1'),
    };

    backupsAutomationServiceMock = {
      getStatus: jest.fn().mockReturnValue({
        health: 'disabled',
        automationEnabled: false,
        functionalCron: '0 3 * * *',
        technicalCron: '0 4 * * *',
        functionalRegistered: false,
        technicalRegistered: false,
        lastCheckedAt: '2026-03-31T12:00:00.000Z',
      }),
    };

    backupJobOrchestratorServiceMock = {
      createManualFunctionalBackup: jest.fn().mockResolvedValue({
        id: 'job-1',
        kind: 'functional_user',
        trigger: 'manual',
        status: 'pending',
        manifestVersion: 1,
        createdAt: new Date('2026-03-31T12:00:00.000Z'),
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        FunctionalBackupsService,
        { provide: BackupsRepository, useValue: repositoryMock },
        {
          provide: BackupsAutomationService,
          useValue: backupsAutomationServiceMock,
        },
        {
          provide: BackupJobOrchestratorService,
          useValue: backupJobOrchestratorServiceMock,
        },
        {
          provide: STORAGE_PROVIDER,
          useValue: storageProviderMock,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              const values: Record<string, unknown> = {
                BACKUP_RETENTION_COUNT: 7,
                BACKUP_HISTORY_LIMIT: 7,
                BACKUP_SIGNED_URL_TTL_SECONDS: 300,
              };
              return key in values ? values[key] : fallback;
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(FunctionalBackupsService);
  });

  it('should create manual functional backups through the orchestrator', async () => {
    const result = await service.createManualBackup('user-1');

    expect(
      backupJobOrchestratorServiceMock.createManualFunctionalBackup,
    ).toHaveBeenCalledWith('user-1');
    expect(result.id).toBe('job-1');
  });

  it('should list user backups with the configured history limit', async () => {
    await service.listBackups('user-1');

    expect(repositoryMock.listUserJobs).toHaveBeenCalledWith('user-1', 7);
  });

  it('should preserve pre-import backups in the user history response', async () => {
    repositoryMock.listUserJobs.mockResolvedValueOnce([
      {
        id: 'pre-import-1',
        kind: 'functional_user',
        trigger: 'pre_import',
        status: 'success',
        checksum: 'checksum-1',
        sizeBytes: 1024,
        manifestVersion: 1,
        createdAt: new Date('2026-04-01T12:00:00.000Z'),
        startedAt: new Date('2026-04-01T12:00:01.000Z'),
        finishedAt: new Date('2026-04-01T12:00:02.000Z'),
        metadataJson: JSON.stringify({ counts: { clients: 3 } }),
      },
    ]);

    const result = await service.listBackups('user-1');

    expect(result).toEqual([
      expect.objectContaining({
        id: 'pre-import-1',
        kind: 'functional_user',
        trigger: 'pre_import',
        status: 'success',
        checksum: 'checksum-1',
        sizeBytes: 1024,
        metadata: { counts: { clients: 3 } },
      }),
    ]);
  });

  it('should expose the current functional backup status', () => {
    const result = service.getStatus();

    expect(backupsAutomationServiceMock.getStatus).toHaveBeenCalled();
    expect(result).toEqual({
      automation: expect.objectContaining({
        health: 'disabled',
        automationEnabled: false,
      }),
      historyLimit: 7,
      retentionCount: 7,
    });
  });

  it('should return a signed download URL for completed user backups', async () => {
    repositoryMock.findUserJob.mockResolvedValue({
      id: 'job-1',
      status: 'success',
      storageKey: 'backups/user-1/2026-03-31/job-1.zip',
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
    });

    const result = await service.getDownloadUrl('user-1', 'job-1');

    expect(storageProviderMock.getSignedUrl).toHaveBeenCalledWith(
      'backups/user-1/2026-03-31/job-1.zip',
      expect.objectContaining({
        visibility: 'private',
      }),
    );
    expect(result.url).toBe('https://signed.example.com/job-1');
  });

  it('should allow downloads for successful pre-import backups', async () => {
    repositoryMock.findUserJob.mockResolvedValueOnce({
      id: 'pre-import-1',
      kind: 'functional_user',
      trigger: 'pre_import',
      status: 'success',
      storageKey: 'backups/user-1/pre-import/2026-04-01/pre-import-1.zip',
      createdAt: new Date('2026-04-01T12:00:00.000Z'),
    });

    const result = await service.getDownloadUrl('user-1', 'pre-import-1');

    expect(repositoryMock.findUserJob).toHaveBeenCalledWith(
      'user-1',
      'pre-import-1',
    );
    expect(storageProviderMock.getSignedUrl).toHaveBeenCalledWith(
      'backups/user-1/pre-import/2026-04-01/pre-import-1.zip',
      expect.objectContaining({
        visibility: 'private',
      }),
    );
    expect(result.url).toBe('https://signed.example.com/job-1');
  });

});
