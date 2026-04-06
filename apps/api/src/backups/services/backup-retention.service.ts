import { Inject, Injectable, Logger } from '@nestjs/common';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';
import type { IStorageProvider } from '../../storage/interfaces/storage-provider.interface';
import { BackupsRepository } from '../backups.repository';
import type { BackupJobRecord } from '../backups.repository';

@Injectable()
export class BackupRetentionService {
  private readonly logger = new Logger(BackupRetentionService.name);

  constructor(
    private readonly backupsRepository: BackupsRepository,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  async pruneFunctionalBackups(userId: string, retentionCount: number) {
    const successfulJobs =
      await this.backupsRepository.listSuccessfulFunctionalJobs(userId);
    const jobsToDelete = successfulJobs.slice(retentionCount);

    for (const job of jobsToDelete) {
      await this.deleteBackupObject(job);
    }
  }

  async prunePreImportBackups(userId: string, retentionCount: number) {
    const successfulJobs =
      await this.backupsRepository.listSuccessfulPreImportJobs(userId);
    const jobsToDelete = successfulJobs.slice(retentionCount);

    for (const job of jobsToDelete) {
      await this.deleteBackupObject(job);
    }
  }

  async pruneTechnicalBackups(retentionCount: number) {
    const successfulJobs =
      await this.backupsRepository.listSuccessfulTechnicalJobs();
    const jobsToDelete = successfulJobs.slice(retentionCount);

    for (const job of jobsToDelete) {
      await this.deleteBackupObject(job);
    }
  }

  private async deleteBackupObject(job: BackupJobRecord) {
    if (!job.storageKey) {
      await this.backupsRepository.delete(job.id);
      return;
    }

    try {
      await this.storageProvider.delete(job.storageKey, {
        visibility: 'private',
      });
      await this.backupsRepository.delete(job.id);
    } catch (error) {
      this.logger.error(
        `Falha ao aplicar retencao do backup ${job.id}: ${this.getErrorMessage(error)}`,
      );
    }
  }

  private getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : 'Erro desconhecido';
  }
}
