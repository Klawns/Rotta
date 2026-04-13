import {
  Injectable,
  Inject,
  BadRequestException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { pipeline } from 'node:stream/promises';
import sharp, { type OutputInfo, type Sharp } from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import type {
  IStorageProvider,
  StorageVisibility,
} from '../storage/interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from '../storage/interfaces/storage-provider.interface';
import {
  DEFAULT_UPLOAD_IMAGE_FOLDER,
  hasAllowedUploadImageExtension,
  INVALID_UPLOAD_IMAGE_FOLDER_MESSAGE,
  UPLOAD_IMAGE_MAX_CONCURRENT_PROCESSING,
  isAllowedUploadImageFormat,
  isAllowedUploadImageFolder,
  UPLOAD_IMAGE_MAX_INPUT_PIXELS,
  type UploadImageFolder,
} from './upload-image.constants';
import type {
  UploadImageBufferFile,
  UploadImageStreamFile,
} from './upload-image.types';

type UploadImageNamedFile = {
  originalname: string;
};

type UploadImageStorageResult = {
  key: string;
  url?: string;
};

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private activeUploadProcessingCount = 0;

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  private resolveFolder(folder?: string): UploadImageFolder {
    if (typeof folder === 'undefined') {
      return DEFAULT_UPLOAD_IMAGE_FOLDER;
    }

    if (isAllowedUploadImageFolder(folder)) {
      return folder;
    }

    throw new BadRequestException(INVALID_UPLOAD_IMAGE_FOLDER_MESSAGE);
  }

  private buildUploadPath(
    userId: string,
    folder: UploadImageFolder,
    fileName: string,
  ) {
    if (folder === 'rides') {
      return `users/${userId}/rides/${fileName}`;
    }

    return `${folder}/${fileName}`;
  }

  private resolveUploadVisibility(folder: UploadImageFolder): StorageVisibility {
    return folder === 'rides' ? 'private' : 'public';
  }

  private ensureUploadFile(file: UploadImageBufferFile | undefined) {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('Arquivo de imagem nao enviado.');
    }
  }

  private ensureAllowedOriginalExtension(file: UploadImageNamedFile) {
    if (hasAllowedUploadImageExtension(file.originalname)) {
      return;
    }

    this.logger.warn(
      `Tentativa de upload com extensao invalida: ${file.originalname}`,
    );
    throw new BadRequestException(
      'Arquivo invalido. Envie apenas imagens JPG, PNG ou WEBP.',
    );
  }

  private createInputImage(file: UploadImageBufferFile) {
    return sharp(file.buffer, {
      failOn: 'error',
      limitInputPixels: UPLOAD_IMAGE_MAX_INPUT_PIXELS,
    });
  }

  private ensureValidImageDimensions(
    file: UploadImageNamedFile,
    metadata: {
      width?: number;
      height?: number;
    },
  ) {
    if (!metadata.width || !metadata.height) {
      this.logger.warn(`Imagem sem dimensoes validas: ${file.originalname}`);
      throw new BadRequestException(
        'Arquivo invalido. A imagem precisa informar largura e altura validas.',
      );
    }

    if (metadata.width * metadata.height > UPLOAD_IMAGE_MAX_INPUT_PIXELS) {
      this.logger.warn(
        `Imagem excede limite de pixels: ${file.originalname} (${metadata.width}x${metadata.height})`,
      );
      throw new BadRequestException(
        'Arquivo invalido. A imagem excede o limite de pixels permitido.',
      );
    }
  }

  private buildInvalidImageError(
    file: UploadImageNamedFile,
    error: unknown,
    context: 'validar' | 'processar',
  ) {
    if (
      error instanceof BadRequestException ||
      !(
        error instanceof Error &&
        error.message.toLowerCase().includes('pixel limit')
      )
    ) {
      return error instanceof BadRequestException
        ? error
        : new BadRequestException(
            'Arquivo invalido. O conteudo nao e uma imagem suportada (JPG, PNG ou WEBP).',
          );
    }

    this.logger.warn(
      `Imagem excedeu limite de pixels ao ${context} ${file.originalname}: ${error.message}`,
    );

    return new BadRequestException(
      'Arquivo invalido. A imagem excede o limite de pixels permitido.',
    );
  }

  private isSharpPixelLimitError(error: unknown) {
    return (
      error instanceof Error &&
      error.message.toLowerCase().includes('pixel limit')
    );
  }

  private toUploadUnavailableException(
    file: UploadImageNamedFile,
    error: unknown,
  ) {
    this.logger.error(
      `Falha operacional no upload da imagem ${file.originalname}: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      error instanceof Error ? error.stack : undefined,
    );

    return new ServiceUnavailableException(
      'Nao foi possivel concluir o upload da imagem no momento. Tente novamente em instantes.',
    );
  }

  private async createProcessedImage(file: UploadImageBufferFile) {
    const image = this.createInputImage(file);

    try {
      const metadata = await image.metadata();

      if (!isAllowedUploadImageFormat(metadata.format)) {
        throw new BadRequestException(
          'Arquivo invalido. O conteudo nao e uma imagem suportada (JPG, PNG ou WEBP).',
        );
      }

      this.ensureValidImageDimensions(file, metadata);

      return image
        .rotate()
        .resize({
          width: 1200,
          height: 1200,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 80,
          effort: 4,
        });
    } catch (error) {
      this.logger.warn(
        `Falha ao validar o conteudo da imagem ${file.originalname}: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
      throw this.buildInvalidImageError(file, error, 'validar');
    }
  }

  private createInputImageStream() {
    return sharp({
      failOn: 'error',
      limitInputPixels: UPLOAD_IMAGE_MAX_INPUT_PIXELS,
    });
  }

  private createProcessedImageStream(inputImage: Sharp) {
    return inputImage.clone().rotate().resize({
      width: 1200,
      height: 1200,
      fit: 'inside',
      withoutEnlargement: true,
    }).webp({
      quality: 80,
      effort: 4,
    });
  }

  private abortStreamUpload(
    upload: UploadImageStreamFile,
    inputImage: Sharp,
    processedImage: Sharp,
    error: unknown,
  ) {
    const streamError = error instanceof Error ? error : undefined;

    upload.cancel(streamError);
    inputImage.destroy();
    processedImage.destroy();
  }

  private async cleanupUploadedImage(
    key: string,
    visibility: StorageVisibility,
  ) {
    try {
      await this.storageProvider.delete(key, {
        visibility,
      });
    } catch (error) {
      this.logger.error(
        {
          context: 'cleanupUploadedImage',
          key,
          visibility,
          message:
            error instanceof Error ? error.message : 'Erro desconhecido',
        },
        error instanceof Error ? error.stack : undefined,
      );
    }
  }

  private acquireUploadProcessingSlot(file: UploadImageNamedFile) {
    if (
      this.activeUploadProcessingCount >=
      UPLOAD_IMAGE_MAX_CONCURRENT_PROCESSING
    ) {
      this.logger.warn(
        `Upload rejeitado por saturacao de processamento: ${file.originalname}. Em andamento: ${this.activeUploadProcessingCount}. Limite: ${UPLOAD_IMAGE_MAX_CONCURRENT_PROCESSING}.`,
      );
      throw new ServiceUnavailableException(
        'Muitos uploads de imagem estao em processamento no momento. Tente novamente em instantes.',
      );
    }

    this.activeUploadProcessingCount += 1;
    let released = false;

    return () => {
      if (released) {
        return;
      }

      released = true;
      this.activeUploadProcessingCount = Math.max(
        0,
        this.activeUploadProcessingCount - 1,
      );
    };
  }

  async uploadImageStream(
    upload: UploadImageStreamFile,
    userId: string,
    folder?: string,
  ) {
    const normalizedFolder = this.resolveFolder(folder);
    this.ensureAllowedOriginalExtension(upload);
    let releaseProcessingSlot: (() => void) | undefined;

    try {
      releaseProcessingSlot = this.acquireUploadProcessingSlot(upload);
    } catch (error) {
      upload.cancel(
        error instanceof Error
          ? error
          : new Error('Upload rejeitado por saturacao de processamento.'),
      );
      throw error;
    }

    this.logger.log(
      `Recebendo solicitacao de upload por stream: ${upload.originalname} para pasta ${normalizedFolder}`,
    );

    const inputImage = this.createInputImageStream();
    const processedImage = this.createProcessedImageStream(inputImage);
    const metadataPromise = inputImage.metadata();
    const inputPipeline = pipeline(upload.stream, inputImage);
    void inputPipeline.catch(() => undefined);

    let processedImageSizeBytes: number | undefined;
    let streamLifecycleClosed = false;
    processedImage.once('info', (info: OutputInfo) => {
      processedImageSizeBytes = info.size;
    });
    processedImage.once('error', (error) => {
      if (streamLifecycleClosed && error.message === 'The operation was aborted') {
        return;
      }

      this.logger.warn(
        `Falha ao processar imagem ${upload.originalname}: ${error.message}`,
      );
    });

    const fileName = `${uuidv4()}.webp`;
    const path = this.buildUploadPath(userId, normalizedFolder, fileName);
    const visibility = this.resolveUploadVisibility(normalizedFolder);
    const start = Date.now();

    try {
      const metadata = await metadataPromise;

      if (!isAllowedUploadImageFormat(metadata.format)) {
        throw new BadRequestException(
          'Arquivo invalido. O conteudo nao e uma imagem suportada (JPG, PNG ou WEBP).',
        );
      }

      this.ensureValidImageDimensions(upload, metadata);
    } catch (error) {
      this.logger.warn(
        `Falha ao validar o conteudo da imagem ${upload.originalname}: ${error instanceof Error ? error.message : 'erro desconhecido'}`,
      );
      streamLifecycleClosed = true;
      this.abortStreamUpload(upload, inputImage, processedImage, error);
      throw this.buildInvalidImageError(upload, error, 'validar');
    }

    let uploadPersisted = false;
    let uploadToStorage: Promise<UploadImageStorageResult> | undefined;

    try {
      uploadToStorage =
        normalizedFolder === 'rides'
          ? this.storageProvider.uploadPrivateStream(
              {
                stream: processedImage,
                mimetype: 'image/webp',
                originalname: upload.originalname,
              },
              path,
              {
                cacheControl: 'private, no-store',
                contentDisposition: 'inline',
              },
            )
          : this.storageProvider.uploadStream(
              {
                stream: processedImage,
                mimetype: 'image/webp',
                originalname: upload.originalname,
              },
              path,
              {
                cacheControl: 'public, max-age=31536000, immutable',
              },
            );
      uploadToStorage = uploadToStorage.then((result) => {
        uploadPersisted = true;
        return result;
      });
      void uploadToStorage.catch(() => undefined);

      await inputPipeline;
      await upload.completed;
      const uploadResult = await uploadToStorage;

      this.logger.log(
        `Sharp processing time: ${Date.now() - start}ms. Tamanho final: ${processedImageSizeBytes ?? 'desconhecido'} bytes`,
      );

      const { key } = uploadResult;
      const url = 'url' in uploadResult ? uploadResult.url : undefined;

      this.logger.log(`Disparando evento image.uploaded para ${key}`);
      this.eventEmitter.emit('image.uploaded', {
        url,
        key,
        originalName: upload.originalname,
        mimetype: 'image/webp',
      });

      streamLifecycleClosed = true;
      return url ? { url, key } : { key };
    } catch (error) {
      streamLifecycleClosed = true;
      this.abortStreamUpload(upload, inputImage, processedImage, error);

      if (uploadToStorage) {
        try {
          await uploadToStorage;
        } catch {
          // Preserve the original failure after settling the storage upload.
        }
      }

      if (uploadPersisted) {
        await this.cleanupUploadedImage(path, visibility);
      }

      if (error instanceof BadRequestException) {
        throw error;
      }

      if (this.isSharpPixelLimitError(error)) {
        throw this.buildInvalidImageError(upload, error, 'processar');
      }

      throw this.toUploadUnavailableException(upload, error);
    } finally {
      releaseProcessingSlot?.();
    }
  }

  async uploadImage(
    file: UploadImageBufferFile,
    userId: string,
    folder?: string,
  ) {
    const normalizedFolder = this.resolveFolder(folder);
    this.ensureUploadFile(file);
    this.ensureAllowedOriginalExtension(file);
    const releaseProcessingSlot = this.acquireUploadProcessingSlot(file);

    try {
      this.logger.log(
        `Recebendo solicitacao de upload: ${file.originalname} (Tamanho original: ${file.size} bytes) para pasta ${normalizedFolder}`,
      );

      // 1. Validacao real do conteudo da imagem antes do processamento.
      const processedImage = await this.createProcessedImage(file);

      // 2. Processamento com Sharp
      this.logger.debug(
        `Iniciando processamento Sharp para ${file.originalname}`,
      );
      const start = Date.now();

      // 3. Gerar nome unico e caminho controlado
      const fileName = `${uuidv4()}.webp`;
      const path = this.buildUploadPath(userId, normalizedFolder, fileName);

      // 4. Upload via Storage Provider
      let processedImageSizeBytes: number | undefined;
      processedImage.once('info', (info: OutputInfo) => {
        processedImageSizeBytes = info.size;
      });
      processedImage.once('error', (error) => {
        this.logger.warn(
          `Falha ao processar imagem ${file.originalname}: ${error.message}`,
        );
      });

      const uploadResult =
        normalizedFolder === 'rides'
          ? await (async () => {
              try {
                const result = await this.storageProvider.uploadPrivateStream(
                  {
                    stream: processedImage,
                    mimetype: 'image/webp',
                    originalname: file.originalname,
                  },
                  path,
                  {
                    cacheControl: 'private, no-store',
                    contentDisposition: 'inline',
                  },
                );

                this.logger.log(
                  `Sharp processing time: ${Date.now() - start}ms. Tamanho final: ${processedImageSizeBytes ?? 'desconhecido'} bytes`,
                );

                return result;
              } catch (error) {
                if (this.isSharpPixelLimitError(error)) {
                  throw this.buildInvalidImageError(file, error, 'processar');
                }

                throw error;
              }
            })()
          : await this.storageProvider.upload(
              {
                buffer: await (async () => {
                  try {
                    const processedBuffer = await processedImage.toBuffer();

                    this.logger.log(
                      `Sharp processing time: ${Date.now() - start}ms. Tamanho final: ${processedBuffer.length} bytes`,
                    );

                    return processedBuffer;
                  } catch (error) {
                    if (this.isSharpPixelLimitError(error)) {
                      throw this.buildInvalidImageError(file, error, 'processar');
                    }

                    throw error;
                  }
                })(),
                mimetype: 'image/webp',
                originalname: file.originalname,
              },
              path,
              {
                cacheControl: 'public, max-age=31536000, immutable',
              },
            );
      const url = 'url' in uploadResult ? uploadResult.url : undefined;
      const { key } = uploadResult;

      // 5. Emitir evento
      this.logger.log(`Disparando evento image.uploaded para ${key}`);
      this.eventEmitter.emit('image.uploaded', {
        url,
        key,
        originalName: file.originalname,
        mimetype: 'image/webp',
      });

      return url ? { url, key } : { key };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      if (this.isSharpPixelLimitError(error)) {
        throw this.buildInvalidImageError(file, error, 'processar');
      }

      throw this.toUploadUnavailableException(file, error);
    } finally {
      releaseProcessingSlot();
    }
  }
}
