/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Jest mocks are intentionally partial. */
import {
  BadRequestException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';
import { BackupsRepository } from '../backups.repository';
import { BackupJobOrchestratorService } from './backup-job-orchestrator.service';
import { TechnicalBackupsService } from './technical-backups.service';

describe('TechnicalBackupsService', () => {
  let service: TechnicalBackupsService;
  let repositoryMock: any;
  let orchestratorMock: any;
  let storageProviderMock: any;

  beforeEach(async () => {
    repositoryMock = {
      listTechnicalJobs: jest.fn().mockResolvedValue([]),
      findTechnicalJob: jest.fn(),
    };

    orchestratorMock = {
      createManualTechnicalBackup: jest.fn().mockResolvedValue({
        id: 'tech-1',
        kind: 'technical_full',
        trigger: 'manual',
        status: 'pending',
        manifestVersion: 1,
        createdAt: new Date('2026-03-31T12:00:00.000Z'),
      }),
    };

    storageProviderMock = {
      getSignedUrl: jest
        .fn()
        .mockResolvedValue('https://signed.example.com/tech-1'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechnicalBackupsService,
        { provide: BackupsRepository, useValue: repositoryMock },
        {
          provide: BackupJobOrchestratorService,
          useValue: orchestratorMock,
        },
        {
          provide: STORAGE_PROVIDER,
          useValue: storageProviderMock,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, fallback?: unknown) => {
              if (key === 'BACKUP_HISTORY_LIMIT') {
                return 7;
              }

              if (key === 'BACKUP_SIGNED_URL_TTL_SECONDS') {
                return 300;
              }

              return fallback;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<TechnicalBackupsService>(TechnicalBackupsService);
  });

  it('should create a manual technical backup via the orchestrator', async () => {
    const result = await service.createManualBackup('admin-1');

    expect(orchestratorMock.createManualTechnicalBackup).toHaveBeenCalledWith(
      'admin-1',
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'tech-1',
        status: 'pending',
      }),
    );
  });

  it('should translate schema errors when listing technical backups', async () => {
    repositoryMock.listTechnicalJobs.mockRejectedValue(
      new Error(
        'invalid input value for enum backup_job_kind: "technical_full"',
      ),
    );

    await expect(service.listBackups()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });

  it('should return a signed download URL for a completed technical backup', async () => {
    repositoryMock.findTechnicalJob.mockResolvedValue({
      id: 'tech-1',
      status: 'success',
      storageKey: 'backups/technical/manual/2026-03-31/tech-1.sql.gz',
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
    });

    const result = await service.getDownloadUrl('tech-1');

    expect(storageProviderMock.getSignedUrl).toHaveBeenCalledWith(
      'backups/technical/manual/2026-03-31/tech-1.sql.gz',
      expect.objectContaining({
        visibility: 'private',
      }),
    );
    expect(result).toEqual({
      id: 'tech-1',
      url: 'https://signed.example.com/tech-1',
      expiresInSeconds: 300,
    });
  });

  it('should reject downloads for backups that are not ready', async () => {
    repositoryMock.findTechnicalJob.mockResolvedValue({
      id: 'tech-1',
      status: 'pending',
      storageKey: null,
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
    });

    await expect(service.getDownloadUrl('tech-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should raise not found when the technical backup does not exist', async () => {
    repositoryMock.findTechnicalJob.mockResolvedValue(null);

    await expect(service.getDownloadUrl('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
