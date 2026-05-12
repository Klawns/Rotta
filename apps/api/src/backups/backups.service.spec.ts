/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access -- Jest mocks are intentionally partial. */
import { Test, TestingModule } from '@nestjs/testing';
import { BackupsService } from './backups.service';
import { FunctionalBackupImportService } from './services/functional-backup-import.service';
import { FunctionalBackupsService } from './services/functional-backups.service';
import { TechnicalBackupsService } from './services/technical-backups.service';

describe('BackupsService', () => {
  let service: BackupsService;
  let moduleRef: TestingModule;
  let importServiceMock: any;
  let createManualBackupMock: jest.Mock;
  let listFunctionalBackupsMock: jest.Mock;
  let getFunctionalStatusMock: jest.Mock;
  let getFunctionalDownloadUrlMock: jest.Mock;
  let createTechnicalBackupMock: jest.Mock;
  let listTechnicalBackupsMock: jest.Mock;
  let getTechnicalDownloadUrlMock: jest.Mock;
  let getTechnicalDownloadFileMock: jest.Mock;

  beforeEach(async () => {
    importServiceMock = {
      previewImport: jest.fn(),
      getImportStatus: jest.fn(),
      executeImport: jest.fn(),
    };

    createManualBackupMock = jest.fn().mockResolvedValue({
      id: 'job-1',
      kind: 'functional_user',
      trigger: 'manual',
      status: 'pending',
      manifestVersion: 1,
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
    });
    listFunctionalBackupsMock = jest.fn().mockResolvedValue([]);
    getFunctionalStatusMock = jest.fn().mockReturnValue({
      automation: {
        health: 'disabled',
        automationEnabled: false,
      },
      historyLimit: 7,
      retentionCount: 7,
    });
    getFunctionalDownloadUrlMock = jest.fn().mockResolvedValue({
      id: 'job-1',
      url: 'https://signed.example.com/job-1',
      expiresInSeconds: 300,
    });

    const functionalBackupsServiceMock = {
      createManualBackup: createManualBackupMock,
      listBackups: listFunctionalBackupsMock,
      getStatus: getFunctionalStatusMock,
      getDownloadUrl: getFunctionalDownloadUrlMock,
    };

    listTechnicalBackupsMock = jest.fn().mockResolvedValue([]);
    getTechnicalDownloadUrlMock = jest.fn().mockResolvedValue({
      id: 'tech-1',
      url: 'https://signed.example.com/tech-1',
      expiresInSeconds: 300,
    });
    getTechnicalDownloadFileMock = jest.fn().mockResolvedValue({
      stream: {},
      fileName: 'technical-backup.sql.gz',
      contentType: 'application/gzip',
    });

    createTechnicalBackupMock = jest.fn().mockResolvedValue({
      id: 'tech-1',
      kind: 'technical_full',
      trigger: 'manual',
      status: 'pending',
      manifestVersion: 1,
      createdAt: new Date('2026-03-31T12:00:00.000Z'),
    });

    const technicalBackupsServiceMock = {
      createManualBackup: createTechnicalBackupMock,
      listBackups: listTechnicalBackupsMock,
      getDownloadUrl: getTechnicalDownloadUrlMock,
      getDownloadFile: getTechnicalDownloadFileMock,
    };

    moduleRef = await Test.createTestingModule({
      providers: [
        BackupsService,
        {
          provide: FunctionalBackupImportService,
          useValue: importServiceMock,
        },
        {
          provide: FunctionalBackupsService,
          useValue: functionalBackupsServiceMock,
        },
        {
          provide: TechnicalBackupsService,
          useValue: technicalBackupsServiceMock,
        },
      ],
    }).compile();

    service = moduleRef.get<BackupsService>(BackupsService);
  });

  it('should delegate manual functional backup creation to the orchestrator', async () => {
    const result = await service.createManualFunctionalBackup('user-1');

    expect(createManualBackupMock).toHaveBeenCalledWith('user-1');
    expect(result.id).toBe('job-1');
    expect(result.status).toBe('pending');
  });

  it('should return a signed download URL for completed user backups', async () => {
    const result = await service.getDownloadUrl('user-1', 'job-1');

    expect(getFunctionalDownloadUrlMock).toHaveBeenCalledWith(
      'user-1',
      'job-1',
    );
    expect(result.url).toBe('https://signed.example.com/job-1');
  });

  it('should delegate manual technical backup creation to the orchestrator', async () => {
    const result = await service.createManualTechnicalBackup('admin-1');

    expect(createTechnicalBackupMock).toHaveBeenCalledWith('admin-1');
    expect(result.id).toBe('tech-1');
  });

  it('should list backups using the configured history limit', async () => {
    await service.listUserBackups('user-1');

    expect(listFunctionalBackupsMock).toHaveBeenCalledWith('user-1');
  });

  it('should delegate technical backup listing to the dedicated service', async () => {
    await service.listTechnicalBackups();

    expect(listTechnicalBackupsMock).toHaveBeenCalled();
  });

  it('should delegate technical backup proxy file retrieval to the dedicated service', async () => {
    await service.getTechnicalDownloadFile('tech-1');

    expect(getTechnicalDownloadFileMock).toHaveBeenCalledWith('tech-1');
  });

  it('should expose the current backup automation status', () => {
    const result = service.getUserBackupStatus();

    expect(getFunctionalStatusMock).toHaveBeenCalled();
    expect(result).toEqual({
      automation: expect.objectContaining({
        health: 'disabled',
        automationEnabled: false,
      }),
      historyLimit: 7,
      retentionCount: 7,
    });
  });

  it('should proxy functional import status requests', async () => {
    importServiceMock.getImportStatus.mockResolvedValue({
      id: 'import-job-1',
      status: 'running',
      phase: 'backing_up',
    });

    const result = await service.getFunctionalImportStatus(
      'user-1',
      'import-job-1',
    );

    expect(importServiceMock.getImportStatus).toHaveBeenCalledWith(
      'user-1',
      'import-job-1',
    );
    expect(result).toEqual(
      expect.objectContaining({
        id: 'import-job-1',
        phase: 'backing_up',
      }),
    );
  });
});
