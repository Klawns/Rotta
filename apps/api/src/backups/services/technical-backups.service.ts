import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';
import type { IStorageProvider } from '../../storage/interfaces/storage-provider.interface';
import { BackupsRepository } from '../backups.repository';
import type { BackupJobRecord } from '../backups.repository';
import { getBackupPublicErrorMessage } from '../backups-public-errors';
import { BackupJobOrchestratorService } from './backup-job-orchestrator.service';
import {
  DEFAULT_BACKUP_HISTORY_LIMIT,
  DEFAULT_BACKUP_SIGNED_URL_TTL_SECONDS,
  TECHNICAL_BACKUP_KIND,
} from '../backups.constants';

@Injectable()
export class TechnicalBackupsService {
  private readonly historyLimit: number;
  private readonly signedUrlTtlSeconds: number;

  constructor(
    private readonly backupsRepository: BackupsRepository,
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
  }

  async createManualBackup(actorUserId: string) {
    const job =
      await this.backupJobOrchestratorService.createManualTechnicalBackup(
        actorUserId,
      );

    return this.toResponse(job);
  }

  async listBackups() {
    try {
      const jobs = await this.backupsRepository.listTechnicalJobs(
        this.historyLimit,
      );

      return jobs.map((job) => this.toResponse(job));
    } catch (error) {
      if (this.isSchemaError(error)) {
        throw this.getUnavailableException();
      }

      throw error;
    }
  }

  async getDownloadUrl(id: string) {
    let job;

    try {
      job = await this.backupsRepository.findTechnicalJob(id);
    } catch (error) {
      if (this.isSchemaError(error)) {
        throw this.getUnavailableException();
      }

      throw error;
    }

    if (!job) {
      throw new NotFoundException('Backup tecnico nao encontrado.');
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
          ? getBackupPublicErrorMessage('processTechnicalJob')
          : null,
      createdAt: job.createdAt,
      startedAt: job.startedAt ?? null,
      finishedAt: job.finishedAt ?? null,
      metadata: this.safeParseMetadata(job.metadataJson),
    };
  }

  private isSchemaError(error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Erro desconhecido';

    return (
      message.includes('backup_jobs') ||
      message.includes('backup_import_jobs') ||
      message.includes('backup_job_kind') ||
      message.includes('backup_job_trigger') ||
      message.includes('backup_import_job_status') ||
      message.includes('technical_full') ||
      message.includes('relation') ||
      message.includes('does not exist') ||
      message.includes('invalid input value for enum')
    );
  }

  private getUnavailableException() {
    return new ServiceUnavailableException(
      'O schema de backups do PostgreSQL ainda nao esta pronto. Aplique as migrations do pacote @mdc/database antes de usar os backups tecnicos.',
    );
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

    return `${TECHNICAL_BACKUP_KIND.replace('_full', '')}-backup-${safeDate}.sql.gz`;
  }
}
