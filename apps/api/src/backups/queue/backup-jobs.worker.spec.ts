/* eslint-disable @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Jest jobs are intentionally partial. */
import { Test, TestingModule } from '@nestjs/testing';
import { BackupJobsWorker } from './backup-jobs.worker';
import { BackupJobOrchestratorService } from '../services/backup-job-orchestrator.service';

describe('BackupJobsWorker', () => {
  let worker: BackupJobsWorker;
  let backupJobOrchestratorServiceMock: any;

  beforeEach(async () => {
    backupJobOrchestratorServiceMock = {
      processQueueJob: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BackupJobsWorker,
        {
          provide: BackupJobOrchestratorService,
          useValue: backupJobOrchestratorServiceMock,
        },
      ],
    }).compile();

    worker = module.get<BackupJobsWorker>(BackupJobsWorker);
  });

  it('should process queued backups by job id', async () => {
    await worker.process({
      id: 'bull-job-1',
      name: 'generate-functional-backup',
      data: {
        backupJobId: 'backup-job-1',
      },
    } as any);

    expect(
      backupJobOrchestratorServiceMock.processQueueJob,
    ).toHaveBeenCalledWith(
      'generate-functional-backup',
      { backupJobId: 'backup-job-1' },
    );
  });
});
