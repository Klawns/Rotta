import { Test, TestingModule } from '@nestjs/testing';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';
import { BackupsRepository } from '../backups.repository';
import { BackupRetentionService } from './backup-retention.service';

describe('BackupRetentionService', () => {
  let service: BackupRetentionService;
  let repositoryMock: any;
  let storageProviderMock: any;

  beforeEach(async () => {
    repositoryMock = {
      listSuccessfulFunctionalJobs: jest.fn().mockResolvedValue([]),
      listSuccessfulPreImportJobs: jest.fn().mockResolvedValue([]),
      listSuccessfulTechnicalJobs: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    storageProviderMock = {
      delete: jest.fn().mockResolvedValue(undefined),
    };

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
      { id: 'pre-1', storageKey: 'backups/users/user-1/pre-import/pre-1.zip' },
      { id: 'pre-2', storageKey: 'backups/users/user-1/pre-import/pre-2.zip' },
      { id: 'pre-3', storageKey: 'backups/users/user-1/pre-import/pre-3.zip' },
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
