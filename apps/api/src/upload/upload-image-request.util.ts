import { BadRequestException } from '@nestjs/common';
import Busboy from 'busboy';
import type { Request } from 'express';
import { basename } from 'node:path';
import type { Readable } from 'node:stream';
import {
  isAllowedUploadImageMimeType,
  UPLOAD_IMAGE_MAX_SIZE_BYTES,
} from './upload-image.constants';
import type { UploadImageStreamFile } from './upload-image.types';

const UPLOAD_IMAGE_FILE_FIELD_NAME = 'image';
const UPLOAD_IMAGE_MULTIPART_FILE_COUNT = 1;
const UPLOAD_IMAGE_MULTIPART_FIELD_COUNT = 0;
const UPLOAD_IMAGE_MULTIPART_PART_COUNT = 2;
const UPLOAD_IMAGE_MULTIPART_HEADER_PAIR_LIMIT = 32;

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

  return sanitized.length > 0 ? sanitized : 'upload-image';
}

export async function parseUploadImageRequest(
  req: Request,
): Promise<UploadImageStreamFile> {
  return new Promise((resolve, reject) => {
    let activeFile: Readable | null = null;
    let completedResolved = false;
    let failed = false;
    let outerResolved = false;
    let fileSeen = false;
    let resolveCompleted!: () => void;
    let rejectCompleted!: (reason?: unknown) => void;
    let parser;

    const completed = new Promise<void>((resolvePromise, rejectPromise) => {
      resolveCompleted = resolvePromise;
      rejectCompleted = rejectPromise;
    });
    void completed.catch(() => undefined);

    try {
      parser = Busboy({
        headers: req.headers,
        preservePath: false,
        limits: {
          fields: UPLOAD_IMAGE_MULTIPART_FIELD_COUNT,
          files: UPLOAD_IMAGE_MULTIPART_FILE_COUNT,
          fileSize: UPLOAD_IMAGE_MAX_SIZE_BYTES,
          parts: UPLOAD_IMAGE_MULTIPART_PART_COUNT,
          headerPairs: UPLOAD_IMAGE_MULTIPART_HEADER_PAIR_LIMIT,
        },
      });
    } catch (error) {
      reject(
        toBadRequestException(
          error,
          'Requisicao multipart invalida para upload de imagem.',
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

    const fail = (error: unknown) => {
      const normalizedError = toBadRequestException(
        error,
        'Falha ao processar o upload da imagem.',
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

      return normalizedError;
    };

    parser.on('file', (fieldName, file, info) => {
      if (failed) {
        file.resume();
        return;
      }

      if (fileSeen) {
        file.resume();
        fail(
          new BadRequestException(
            'Apenas um arquivo de imagem e aceito por requisicao.',
          ),
        );
        return;
      }

      fileSeen = true;

      if (fieldName !== UPLOAD_IMAGE_FILE_FIELD_NAME) {
        file.resume();
        fail(
          new BadRequestException(
            'Campo de upload invalido. Use o campo image.',
          ),
        );
        return;
      }

      const originalname = sanitizeOriginalName(info.filename);
      const mimetype = info.mimeType;

      if (!isAllowedUploadImageMimeType(mimetype)) {
        file.resume();
        fail(
          new BadRequestException(
            'Arquivo invalido. Envie apenas imagens JPG, PNG ou WEBP.',
          ),
        );
        return;
      }

      activeFile = file;

      file.once('limit', () => {
        fail(
          new BadRequestException(
            `Arquivo de imagem excede o limite de ${UPLOAD_IMAGE_MAX_SIZE_BYTES} bytes.`,
          ),
        );
      });

      file.once('error', (streamError) => {
        fail(streamError);
      });

      if (!outerResolved) {
        outerResolved = true;
        resolve({
          completed,
          fieldName,
          mimetype,
          originalname,
          stream: file,
          cancel: (error?: Error) => {
            try {
              file.destroy(error ?? new Error('Upload cancelado.'));
            } catch {
              // Ignore teardown errors during cancellation.
            }
          },
        });
      }
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
      fail(
        new BadRequestException(
          'Apenas um arquivo de imagem e aceito por requisicao.',
        ),
      );
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
      if (failed) {
        return;
      }

      if (!fileSeen || !outerResolved) {
        fail(new BadRequestException('Arquivo de imagem nao enviado.'));
        return;
      }

      finalizeCompletedSuccess();
    });

    req.once('aborted', () => {
      fail(new Error('Upload interrompido pelo cliente.'));
    });

    req.pipe(parser);
  });
}
