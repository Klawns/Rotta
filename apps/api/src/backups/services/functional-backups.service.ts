import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';
import type { IStorageProvider } from '../../storage/interfaces/storage-provider.interface';
import { BackupsAutomationService } from '../backups-automation.service';
import { getBackupPublicErrorMessage } from '../backups-public-errors';
import { BackupsRepository } from '../backups.repository';
import type { BackupJobRecord } from '../backups.repository';
import { BackupJobOrchestratorService } from './backup-job-orchestrator.service';
import {
  DEFAULT_BACKUP_HISTORY_LIMIT,
  DEFAULT_BACKUP_RETENTION_COUNT,
  DEFAULT_BACKUP_SIGNED_URL_TTL_SECONDS,
} from '../backups.constants';

@Injectable()
export class FunctionalBackupsService {
  private readonly retentionCount: number;
  private readonly historyLimit: number;
  private readonly signedUrlTtlSeconds: number;

  constructor(
    private readonly backupsRepository: BackupsRepository,
    private readonly backupsAutomationService: BackupsAutomationService,
    private readonly backupJobOrchestratorService: BackupJobOrchestratorService,
    private readonly configService: ConfigService,
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {
    this.historyLimit = this.configService.get<number>(
      'BACKUP_HISTORY_LIMIT',
      DEFAULT_BACKUP_HISTORY_LIMIT,
    );
    this.signedUrlTtlSeconds = this.configService.get<number>(
      'BACKUP_SIGNED_URL_TTL_SECONDS',
      DEFAULT_BACKUP_SIGNED_URL_TTL_SECONDS,
    );
    this.retentionCount = this.configService.get<number>(
      'BACKUP_RETENTION_COUNT',
      DEFAULT_BACKUP_RETENTION_COUNT,
    );
  }

  async createManualBackup(userId: string) {
    const job =
      await this.backupJobOrchestratorService.createManualFunctionalBackup(
        userId,
      );

    return this.toResponse(job);
  }

  async listBackups(userId: string) {
    const jobs = await this.backupsRepository.listUserJobs(
      userId,
      this.historyLimit,
    );

    return jobs.map((job) => this.toResponse(job));
  }

  getStatus() {
    const automation = this.backupsAutomationService.getStatus();

    return {
      automation,
      historyLimit: this.historyLimit,
      retentionCount: this.retentionCount,
    };
  }

  async getDownloadUrl(userId: string, id: string) {
    const job = await this.backupsRepository.findUserJob(userId, id);

    if (!job) {
      throw new NotFoundException('Backup nao encontrado.');
    }

    return this.buildSignedDownloadResponse(job);
  }

  private safeParseMetadata(
    metadataJson?: string | null,
  ): Record<string, unknown> | null {
    if (!metadataJson) {
      return null;
    }

    try {
      return JSON.parse(metadataJson) as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private toResponse(job: BackupJobRecord) {
    return {
      id: job.id,
      kind: job.kind,
      trigger: job.trigger,
      status: job.status,
      checksum: job.checksum ?? null,
      sizeBytes: job.sizeBytes ?? null,
      manifestVersion: job.manifestVersion,
      errorMessage:
        job.status === 'failed'
          ? getBackupPublicErrorMessage('processFunctionalJob')
          : null,
      createdAt: job.createdAt,
      startedAt: job.startedAt ?? null,
      finishedAt: job.finishedAt ?? null,
      metadata: this.safeParseMetadata(job.metadataJson),
    };
  }

  private async buildSignedDownloadResponse(job: BackupJobRecord) {
    if (job.status !== 'success' || !job.storageKey) {
      throw new BadRequestException(
        'O backup ainda nao esta disponivel para download.',
      );
    }

    const url = await this.storageProvider.getSignedUrl(job.storageKey, {
      expiresInSeconds: this.signedUrlTtlSeconds,
      downloadName: this.buildDownloadFileName(job.createdAt),
      visibility: 'private',
    });

    return {
      id: job.id,
      url,
      expiresInSeconds: this.signedUrlTtlSeconds,
    };
  }

  private buildDownloadFileName(createdAt: Date | string) {
    const isoDate =
      createdAt instanceof Date ? createdAt.toISOString() : String(createdAt);
    const safeDate = isoDate.replace(/[:.]/g, '-');

    return `backup-${safeDate}.zip`;
  }
}
