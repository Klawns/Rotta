import { Test, TestingModule } from '@nestjs/testing';
import type { IStorageProvider } from '../../storage/interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';
import {
  BackupsRepository,
  type BackupJobRecord,
} from '../backups.repository';
import {
  FUNCTIONAL_BACKUP_KIND,
  PRE_IMPORT_BACKUP_TRIGGER,
  TECHNICAL_BACKUP_KIND,
} from '../backups.constants';
import { BackupRetentionService } from './backup-retention.service';

type BackupRetentionRepositoryMock = jest.Mocked<
  Pick<
    BackupsRepository,
    | 'listSuccessfulFunctionalJobs'
    | 'listSuccessfulPreImportJobs'
    | 'listSuccessfulTechnicalJobs'
    | 'delete'
  >
>;

type BackupRetentionStorageProviderMock = jest.Mocked<
  Pick<IStorageProvider, 'delete'>
>;

describe('BackupRetentionService', () => {
  let service: BackupRetentionService;
  let repositoryMock: BackupRetentionRepositoryMock;
  let storageProviderMock: BackupRetentionStorageProviderMock;

  beforeEach(async () => {
    repositoryMock = {
      listSuccessfulFunctionalJobs: jest.fn().mockResolvedValue([]),
      listSuccessfulPreImportJobs: jest.fn().mockResolvedValue([]),
      listSuccessfulTechnicalJobs: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
    } as BackupRetentionRepositoryMock;

    storageProviderMock = {
      delete: jest.fn().mockResolvedValue(undefined),
    } as BackupRetentionStorageProviderMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupRetentionService,
        { provide: BackupsRepository, useValue: repositoryMock },
        { provide: STORAGE_PROVIDER, useValue: storageProviderMock },
      ],
    }).compile();

    service = module.get<BackupRetentionService>(BackupRetentionService);
  });

  it('should prune pre-import backups beyond the configured retention count', async () => {
    repositoryMock.listSuccessfulPreImportJobs.mockResolvedValue([
      createBackupJobRecord({
        id: 'pre-1',
        storageKey: 'backups/users/user-1/pre-import/pre-1.zip',
      }),
      createBackupJobRecord({
        id: 'pre-2',
        storageKey: 'backups/users/user-1/pre-import/pre-2.zip',
      }),
      createBackupJobRecord({
        id: 'pre-3',
        storageKey: 'backups/users/user-1/pre-import/pre-3.zip',
      }),
    ]);

    await service.prunePreImportBackups('user-1', 2);

    expect(repositoryMock.listSuccessfulPreImportJobs).toHaveBeenCalledWith(
      'user-1',
    );
    expect(storageProviderMock.delete).toHaveBeenCalledTimes(1);
    expect(storageProviderMock.delete).toHaveBeenCalledWith(
      'backups/users/user-1/pre-import/pre-3.zip',
      { visibility: 'private' },
    );
    expect(repositoryMock.delete).toHaveBeenCalledWith('pre-3');
  });
});

function createBackupJobRecord(
  overrides: Partial<BackupJobRecord> = {},
): BackupJobRecord {
  return {
    id: 'job-1',
    kind: FUNCTIONAL_BACKUP_KIND,
    trigger: PRE_IMPORT_BACKUP_TRIGGER,
    scopeUserId: 'user-1',
    actorUserId: 'user-1',
    status: 'success',
    storageKey: null,
    checksum: null,
    sizeBytes: null,
    manifestVersion: 2,
    metadataJson: null,
    errorMessage: null,
    startedAt: null,
    finishedAt: null,
    createdAt: new Date('2026-04-17T10:00:00.000Z'),
    ...overrides,
  };
}
