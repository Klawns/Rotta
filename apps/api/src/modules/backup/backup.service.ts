import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';

export interface BackupResult {
  success: boolean;
  filename: string;
  timestamp: string;
  sizeBytes?: number;
  error?: string;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly retentionCount: number;

  constructor(private readonly configService: ConfigService) {
    const accountId = this.configService.getOrThrow<string>('R2_ACCOUNT_ID');
    const accessKeyId =
      this.configService.getOrThrow<string>('R2_ACCESS_KEY_ID');
    const secretAccessKey =
      this.configService.getOrThrow<string>('R2_SECRET_ACCESS_KEY');

    this.bucket = this.configService.getOrThrow<string>('R2_BUCKET');
    this.retentionCount = parseInt(
      this.configService.get<string>('BACKUP_RETENTION_DAYS', '7'),
      10,
    );

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    this.logger.log(
      `BackupService initialized — bucket: ${this.bucket}, retention: ${this.retentionCount} backups`,
    );
  }

  async runBackup(): Promise<BackupResult> {
    const now = new Date();
    const timestamp = now.toISOString();
    const safeTimestamp = timestamp.replace(/:/g, '-').replace(/\..+$/, '');
    const filename = `backup-${safeTimestamp}.dump`;

    this.logger.log(`Starting pg_dump backup → ${filename}`);

    const databaseUrl = this.configService.get<string>('DATABASE_URL');
    if (!databaseUrl) {
      const msg = 'DATABASE_URL is not configured';
      this.logger.error(msg);
      return { success: false, filename, timestamp, error: msg };
    }

    // Validate it looks like a postgres URL without logging the value
    if (
      !databaseUrl.startsWith('postgres://') &&
      !databaseUrl.startsWith('postgresql://')
    ) {
      const msg = 'DATABASE_URL does not appear to be a valid PostgreSQL URL';
      this.logger.error(msg);
      return { success: false, filename, timestamp, error: msg };
    }

    let uploadedBytes = 0;

    try {
      uploadedBytes = await this.pgDumpToR2(databaseUrl, filename);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Backup failed during pg_dump/upload: ${message}`);
      return { success: false, filename, timestamp, error: message };
    }

    this.logger.log(
      `Backup uploaded successfully: ${filename} (${uploadedBytes} bytes)`,
    );

    // Enforce retention policy
    try {
      await this.enforceRetention();
    } catch (err) {
      // Non-fatal — log and continue
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Retention cleanup failed (non-fatal): ${message}`);
    }

    return {
      success: true,
      filename,
      timestamp,
      sizeBytes: uploadedBytes,
    };
  }

  private pgDumpToR2(databaseUrl: string, filename: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.logger.debug('Spawning pg_dump process');

      const pgDump = spawn('pg_dump', ['-Fc', '--no-password', databaseUrl], {
        env: {
          ...process.env,
          // Suppress pg_dump from prompting for a password
          PGPASSWORD: this.extractPassword(databaseUrl),
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      const chunks: Buffer[] = [];
      let totalBytes = 0;
      const stderrLines: string[] = [];

      pgDump.stdout.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
        totalBytes += chunk.length;
      });

      pgDump.stderr.on('data', (data: Buffer) => {
        const line = data.toString().trim();
        if (line) {
          stderrLines.push(line);
          this.logger.debug(`pg_dump stderr: ${line}`);
        }
      });

      pgDump.on('error', (err) => {
        reject(
          new Error(
            `Failed to spawn pg_dump (is it installed?): ${err.message}`,
          ),
        );
      });

      pgDump.on('close', (code) => {
        if (code !== 0) {
          const detail = stderrLines.slice(-5).join(' | ');
          reject(
            new Error(
              `pg_dump exited with code ${code}${detail ? `: ${detail}` : ''}`,
            ),
          );
          return;
        }

        this.logger.debug(
          `pg_dump completed (${totalBytes} bytes), uploading to R2`,
        );

        const upload = new PutObjectCommand({
          Bucket: this.bucket,
          Key: filename,
          Body: Buffer.concat(chunks),
          ContentType: 'application/octet-stream',
          ContentLength: totalBytes,
          Metadata: {
            'created-at': new Date().toISOString(),
            'pg-dump-format': 'custom',
          },
        });

        this.client
          .send(upload)
          .then(() => resolve(totalBytes))
          .catch(async (_uploadErr: unknown) => {
            // Retry once on upload failure
            this.logger.warn(
              'First upload attempt failed, retrying once…',
            );
            try {
              await this.client.send(
                new PutObjectCommand({
                  Bucket: this.bucket,
                  Key: filename,
                  Body: Buffer.concat(chunks),
                  ContentType: 'application/octet-stream',
                  ContentLength: totalBytes,
                  Metadata: {
                    'created-at': new Date().toISOString(),
                    'pg-dump-format': 'custom',
                  },
                }),
              );
              resolve(totalBytes);
            } catch (retryErr: unknown) {
              const msg =
                retryErr instanceof Error
                  ? retryErr.message
                  : String(retryErr);
              reject(new Error(`R2 upload failed after retry: ${msg}`));
            }
          });
      });
    });
  }

  private async enforceRetention(): Promise<void> {
    this.logger.debug(
      `Listing backups in bucket "${this.bucket}" with prefix "backup-"`,
    );

    const list = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: 'backup-',
      }),
    );

    const objects = (list.Contents ?? [])
      .filter((obj) => obj.Key && obj.LastModified)
      .sort(
        (a, b) =>
          (b.LastModified?.getTime() ?? 0) - (a.LastModified?.getTime() ?? 0),
      );

    this.logger.debug(
      `Found ${objects.length} backup(s); keeping ${this.retentionCount} most recent`,
    );

    const toDelete = objects.slice(this.retentionCount);

    for (const obj of toDelete) {
      if (!obj.Key) continue;
      this.logger.log(`Deleting old backup: ${obj.Key}`);
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: obj.Key }),
      );
    }

    if (toDelete.length > 0) {
      this.logger.log(`Retention: deleted ${toDelete.length} old backup(s)`);
    }
  }

  /**
   * Extracts the password from a postgres connection URL without logging it.
   * Returns an empty string if no password is present.
   */
  private extractPassword(url: string): string {
    try {
      const parsed = new URL(url);
      return parsed.password ?? '';
    } catch {
      return '';
    }
  }
}
