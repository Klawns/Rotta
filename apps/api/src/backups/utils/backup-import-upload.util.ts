import { BadRequestException } from '@nestjs/common';
import Busboy from 'busboy';
import type { Request } from 'express';
import { createReadStream, createWriteStream } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename } from 'node:path';
import { join } from 'node:path';
import type { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import {
  DEFAULT_BACKUP_IMPORT_FILE_SIZE_LIMIT_BYTES,
  DEFAULT_BACKUP_IMPORT_MULTIPART_FIELD_COUNT,
  DEFAULT_BACKUP_IMPORT_MULTIPART_FILE_COUNT,
  DEFAULT_BACKUP_IMPORT_MULTIPART_HEADER_PAIR_LIMIT,
  DEFAULT_BACKUP_IMPORT_MULTIPART_PART_COUNT,
} from '../backups.constants';
import type { FunctionalBackupImportArchiveSource } from '../services/functional-backup-import.types';

const BACKUP_IMPORT_FILE_FIELD_NAME = 'file';
const ACCEPTED_ZIP_MIME_TYPES = new Set([
  'application/zip',
  'application/x-zip-compressed',
]);

function toBadRequestException(error: unknown, fallbackMessage: string) {
  if (error instanceof BadRequestException) {
    return error;
  }

  if (error instanceof Error && error.message) {
    return new BadRequestException(error.message);
  }

  return new BadRequestException(fallbackMessage);
}

function sanitizeOriginalName(filename: string | undefined) {
  const sanitized = basename(filename ?? '').trim();

  return sanitized.length > 0 ? sanitized : 'backup.zip';
}

function isZipUpload(filename: string, mimeType: string) {
  return (
    ACCEPTED_ZIP_MIME_TYPES.has(mimeType) ||
    filename.toLowerCase().endsWith('.zip')
  );
}

async function removeTemporaryUpload(tempDirectory: string) {
  await rm(tempDirectory, { force: true, recursive: true });
}

export async function parseBackupImportUploadRequest(
  req: Request,
): Promise<FunctionalBackupImportArchiveSource> {
  const tempDirectory = await mkdtemp(join(tmpdir(), 'mdc-backup-import-'));
  const tempArchivePath = join(tempDirectory, 'upload.zip');

  return new Promise((resolve, reject) => {
    let activeFile: Readable | null = null;
    let completedResolved = false;
    let failed = false;
    let outerResolved = false;
    let fileSeen = false;
    let fileMetadata:
      | {
          fieldName: string;
          mimetype: string;
          originalname: string;
        }
      | null = null;
    let temporaryReadStream: Readable | null = null;
    let fileWritePromise: Promise<void> | null = null;
    let cleanupPromise: Promise<void> | null = null;

    let resolveCompleted!: () => void;
    let rejectCompleted!: (reason?: unknown) => void;

    const completed = new Promise<void>((resolvePromise, rejectPromise) => {
      resolveCompleted = resolvePromise;
      rejectCompleted = rejectPromise;
    });
    void completed.catch(() => undefined);

    let parser;

    try {
      parser = Busboy({
        headers: req.headers,
        preservePath: false,
        limits: {
          fields: DEFAULT_BACKUP_IMPORT_MULTIPART_FIELD_COUNT,
          files: DEFAULT_BACKUP_IMPORT_MULTIPART_FILE_COUNT,
          fileSize: DEFAULT_BACKUP_IMPORT_FILE_SIZE_LIMIT_BYTES,
          parts: DEFAULT_BACKUP_IMPORT_MULTIPART_PART_COUNT,
          headerPairs: DEFAULT_BACKUP_IMPORT_MULTIPART_HEADER_PAIR_LIMIT,
        },
      });
    } catch (error) {
      reject(
        toBadRequestException(
          error,
          'Requisicao multipart invalida para importacao de backup.',
        ),
      );
      return;
    }

    const finalizeCompletedError = (error: BadRequestException) => {
      if (!completedResolved) {
        completedResolved = true;
        rejectCompleted(error);
      }
    };

    const finalizeCompletedSuccess = () => {
      if (!completedResolved) {
        completedResolved = true;
        resolveCompleted();
      }
    };

    const cleanupTemporaryUpload = async () => {
      if (!cleanupPromise) {
        cleanupPromise = removeTemporaryUpload(tempDirectory);
      }

      await cleanupPromise;
    };

    const fail = (error: unknown) => {
      const normalizedError = toBadRequestException(
        error,
        'Falha ao processar o upload do arquivo de backup.',
      );

      if (failed) {
        return normalizedError;
      }

      failed = true;

      finalizeCompletedError(normalizedError);

      try {
        activeFile?.destroy(normalizedError);
      } catch {
        // Ignore teardown errors while aborting the upload.
      }

      try {
        temporaryReadStream?.destroy(
          normalizedError instanceof Error ? normalizedError : undefined,
        );
      } catch {
        // Ignore teardown errors while aborting the upload.
      }

      try {
        req.unpipe(parser);
      } catch {
        // The request might already be detached.
      }

      try {
        req.resume();
      } catch {
        // Ignore request draining failures during abort.
      }

      if (!outerResolved) {
        outerResolved = true;
        reject(normalizedError);
      }

      void cleanupTemporaryUpload().catch(() => undefined);

      return normalizedError;
    };

    parser.on('file', (fieldName, file, info) => {
      if (failed) {
        file.resume();
        return;
      }

      if (fileSeen) {
        file.resume();
        fail(new BadRequestException('Apenas um arquivo .zip e aceito por requisicao.'));
        return;
      }

      fileSeen = true;
      activeFile = file;

      if (fieldName !== BACKUP_IMPORT_FILE_FIELD_NAME) {
        file.resume();
        fail(new BadRequestException('Campo de upload invalido. Use o campo file.'));
        return;
      }

      const originalname = sanitizeOriginalName(info.filename);
      const mimetype = info.mimeType;

      if (!isZipUpload(originalname, mimetype)) {
        file.resume();
        fail(new BadRequestException('Apenas arquivos .zip sao aceitos para importacao.'));
        return;
      }

      file.once('limit', () => {
        fail(
          new BadRequestException(
            `Arquivo de backup excede o limite de ${DEFAULT_BACKUP_IMPORT_FILE_SIZE_LIMIT_BYTES} bytes.`,
          ),
        );
      });

      file.once('error', (streamError) => {
        fail(streamError);
      });
      fileMetadata = {
        fieldName,
        mimetype,
        originalname,
      };

      fileWritePromise = pipeline(file, createWriteStream(tempArchivePath));
      void fileWritePromise.catch((streamError) => {
        fail(streamError);
      });
    });

    parser.on('field', () => {
      if (failed) {
        return;
      }

      fail(
        new BadRequestException(
          'Campos adicionais nao sao permitidos neste endpoint.',
        ),
      );
    });

    parser.once('filesLimit', () => {
      fail(new BadRequestException('Apenas um arquivo .zip e aceito por requisicao.'));
    });

    parser.once('fieldsLimit', () => {
      fail(
        new BadRequestException(
          'Campos adicionais nao sao permitidos neste endpoint.',
        ),
      );
    });

    parser.once('partsLimit', () => {
      fail(new BadRequestException('A requisicao multipart contem partes demais.'));
    });

    parser.once('error', (error) => {
      fail(error);
    });

    parser.once('close', () => {
      void (async () => {
        if (failed) {
          return;
        }

        if (!fileSeen || !fileMetadata || !fileWritePromise) {
          fail(new BadRequestException('Arquivo de backup nao enviado.'));
          return;
        }

        try {
          await fileWritePromise;
        } catch (error) {
          fail(error);
          return;
        }

        finalizeCompletedSuccess();

        temporaryReadStream = createReadStream(tempArchivePath);

        if (!outerResolved) {
          outerResolved = true;
          resolve({
            completed,
            fieldName: fileMetadata.fieldName,
            mimetype: fileMetadata.mimetype,
            originalname: fileMetadata.originalname,
            stream: temporaryReadStream,
            cancel: (error?: Error) => {
              try {
                temporaryReadStream?.destroy(
                  error ?? new Error('Upload cancelado.'),
                );
              } finally {
                void cleanupTemporaryUpload().catch(() => undefined);
              }
            },
            dispose: () => cleanupTemporaryUpload(),
          });
        }
      })().catch((error: unknown) => {
        fail(error);
      });
    });

    req.once('aborted', () => {
      fail(new Error('Upload interrompido pelo cliente.'));
    });

    req.pipe(parser);
  });
}
