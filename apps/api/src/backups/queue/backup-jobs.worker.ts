import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BACKUPS_QUEUE } from '../backups.constants';
import { BackupJobOrchestratorService } from '../services/backup-job-orchestrator.service';

export interface BackupJobData {
  backupJobId?: string;
}

@Processor(BACKUPS_QUEUE)
export class BackupJobsWorker extends WorkerHost {
  private readonly logger = new Logger(BackupJobsWorker.name);

  constructor(
    private readonly backupJobOrchestratorService: BackupJobOrchestratorService,
  ) {
    super();
  }

  async process(job: Job<BackupJobData>): Promise<void> {
    this.logger.log(`Processando job de backup ${job.name}. Job ID: ${job.id}`);
    await this.backupJobOrchestratorService.processQueueJob(job.name, {
      ...job.data,
    });
  }
}
