import { PassThrough, Readable } from 'node:stream';
import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { IStorageProvider } from '../storage/interfaces/storage-provider.interface';
import type { UploadImageStreamFile } from './upload-image.types';
import { UPLOAD_IMAGE_MAX_CONCURRENT_PROCESSING } from './upload-image.constants';
import { UploadService } from './upload.service';

jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-42d3-a456-426614174000'),
}));

const TINY_PNG_BUFFER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Zp5QAAAAASUVORK5CYII=',
  'base64',
);

async function readStream(stream: AsyncIterable<Buffer | Uint8Array>) {
  const chunks: Buffer[] = [];

  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks);
}

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });

  return { promise, resolve, reject };
}

describe('UploadService uploadImageStream', () => {
  let service: UploadService;
  let storageProviderMock: jest.Mocked<
    Pick<
      IStorageProvider,
      | 'delete'
      | 'upload'
      | 'uploadStream'
      | 'uploadPrivate'
      | 'uploadPrivateStream'
    >
  >;
  let eventEmitterMock: {
    emit: jest.Mock;
  };

  beforeEach(() => {
    storageProviderMock = {
      upload: jest.fn().mockResolvedValue({
        url: 'https://cdn.example.com/avatars/123e4567-e89b-42d3-a456-426614174000.webp',
        key: 'avatars/123e4567-e89b-42d3-a456-426614174000.webp',
      }),
      uploadStream: jest.fn().mockImplementation(async (file, path) => {
        await readStream(file.stream as AsyncIterable<Buffer | Uint8Array>);
        return {
          url: `https://cdn.example.com/${path}`,
          key: path,
        };
      }),
      uploadPrivate: jest.fn().mockResolvedValue({
        key: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      }),
      uploadPrivateStream: jest.fn().mockImplementation(async (file, path) => {
        await readStream(file.stream as AsyncIterable<Buffer | Uint8Array>);
        return { key: path };
      }),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    eventEmitterMock = {
      emit: jest.fn(),
    };

    service = new UploadService(
      storageProviderMock as unknown as IStorageProvider,
      eventEmitterMock as unknown as EventEmitter2,
    );
  });

  function createUpload(
    overrides: Partial<UploadImageStreamFile> = {},
  ): UploadImageStreamFile {
    return {
      completed: Promise.resolve(),
      fieldName: 'image',
      mimetype: 'image/png',
      originalname: 'ride.png',
      stream: Readable.from([TINY_PNG_BUFFER]),
      cancel: jest.fn(),
      ...overrides,
    };
  }

  it('stores ride uploads through the private streaming pipeline', async () => {
    const upload = createUpload();

    const result = await service.uploadImageStream(upload, 'user-1', 'rides');

    expect(storageProviderMock.uploadPrivateStream).toHaveBeenCalledWith(
      expect.objectContaining({
        mimetype: 'image/webp',
        originalname: 'ride.png',
      }),
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      { cacheControl: 'private, no-store', contentDisposition: 'inline' },
    );
    expect(storageProviderMock.upload).not.toHaveBeenCalled();
    expect(eventEmitterMock.emit).toHaveBeenCalledWith(
      'image.uploaded',
      expect.objectContaining({
        key: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
        mimetype: 'image/webp',
      }),
    );
    expect(result).toEqual({
      key: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    });
  });

  it('stores public folders through the public streaming pipeline', async () => {
    const upload = createUpload({
      originalname: 'avatar.png',
    });

    const result = await service.uploadImageStream(upload, 'user-1', 'avatars');

    expect(storageProviderMock.uploadStream).toHaveBeenCalledWith(
      expect.objectContaining({
        mimetype: 'image/webp',
        originalname: 'avatar.png',
      }),
      'avatars/123e4567-e89b-42d3-a456-426614174000.webp',
      { cacheControl: 'public, max-age=31536000, immutable' },
    );
    expect(storageProviderMock.uploadPrivateStream).not.toHaveBeenCalled();
    expect(storageProviderMock.upload).not.toHaveBeenCalled();
    expect(result).toEqual({
      key: 'avatars/123e4567-e89b-42d3-a456-426614174000.webp',
      url: 'https://cdn.example.com/avatars/123e4567-e89b-42d3-a456-426614174000.webp',
    });
  });

  it('rejects invalid folders instead of falling back silently to images', async () => {
    const upload = createUpload();

    await expect(
      service.uploadImageStream(upload, 'user-1', 'invalid-folder'),
    ).rejects.toThrow(
      new BadRequestException(
        'Pasta de upload invalida. Use images, avatars, posts, thumbnails ou rides.',
      ),
    );
    expect(storageProviderMock.uploadStream).not.toHaveBeenCalled();
    expect(storageProviderMock.uploadPrivateStream).not.toHaveBeenCalled();
  });

  it('rejects streamed content that is not a supported image', async () => {
    const upload = createUpload({
      stream: Readable.from([Buffer.from('not-an-image')]),
    });

    await expect(
      service.uploadImageStream(upload, 'user-1', 'rides'),
    ).rejects.toThrow(
      new BadRequestException(
        'Arquivo invalido. O conteudo nao e uma imagem suportada (JPG, PNG ou WEBP).',
      ),
    );
    expect(storageProviderMock.uploadPrivateStream).not.toHaveBeenCalled();
  });

  it('rejects streamed images that exceed the configured pixel limit', async () => {
    const serviceWithPatchedStreams = service as UploadService & {
      createInputImageStream: () => PassThrough & {
        metadata: jest.Mock<Promise<never>, []>;
      };
      createProcessedImageStream: () => PassThrough;
    };
    const inputImage = new PassThrough() as PassThrough & {
      metadata: jest.Mock<Promise<never>, []>;
    };
    const processedImage = new PassThrough();

    inputImage.metadata = jest
      .fn<Promise<never>, []>()
      .mockRejectedValue(new Error('Input image exceeds pixel limit'));
    serviceWithPatchedStreams.createInputImageStream = jest.fn(
      () => inputImage,
    );
    serviceWithPatchedStreams.createProcessedImageStream = jest.fn(
      () => processedImage,
    );

    const upload = createUpload({
      stream: Readable.from([Buffer.from('pixel-limit-input')]),
    });

    await expect(
      service.uploadImageStream(upload, 'user-1', 'rides'),
    ).rejects.toThrow(
      new BadRequestException(
        'Arquivo invalido. A imagem excede o limite de pixels permitido.',
      ),
    );
    expect(upload.cancel).toHaveBeenCalled();
    expect(storageProviderMock.uploadPrivateStream).not.toHaveBeenCalled();
  });

  it('preserves storage errors in the streaming rides path', async () => {
    storageProviderMock.uploadPrivateStream.mockRejectedValueOnce(
      new Error('storage unavailable'),
    );
    const upload = createUpload();

    await expect(
      service.uploadImageStream(upload, 'user-1', 'rides'),
    ).rejects.toThrow(
      new ServiceUnavailableException(
        'Nao foi possivel concluir o upload da imagem no momento. Tente novamente em instantes.',
      ),
    );
  });

  it('preserves bad request upload failures when the storage stream also aborts', async () => {
    storageProviderMock.uploadPrivateStream.mockRejectedValueOnce(
      new Error('The operation was aborted'),
    );
    const completed = new Promise<void>((_, reject) => {
      setTimeout(() => {
        reject(
          new BadRequestException(
            'Arquivo de imagem excede o limite permitido.',
          ),
        );
      }, 0);
    });
    void completed.catch(() => undefined);
    const upload = createUpload({
      completed,
    });

    await expect(
      service.uploadImageStream(upload, 'user-1', 'rides'),
    ).rejects.toThrow(
      new BadRequestException(
        'Arquivo de imagem excede o limite permitido.',
      ),
    );
  });

  it('rolls back a persisted rides asset when multipart validation fails after upload completion', async () => {
    const storageUploadFinished = createDeferred<void>();

    storageProviderMock.uploadPrivateStream.mockImplementationOnce(
      async (file, path) => {
        await readStream(file.stream as AsyncIterable<Buffer | Uint8Array>);
        storageUploadFinished.resolve();
        return { key: path };
      },
    );

    const completed = storageUploadFinished.promise.then(() => {
      throw new BadRequestException(
        'Campos adicionais nao sao permitidos neste endpoint.',
      );
    });
    void completed.catch(() => undefined);

    const upload = createUpload({
      completed,
    });

    await expect(
      service.uploadImageStream(upload, 'user-1', 'rides'),
    ).rejects.toThrow(
      new BadRequestException(
        'Campos adicionais nao sao permitidos neste endpoint.',
      ),
    );

    expect(storageProviderMock.delete).toHaveBeenCalledWith(
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      { visibility: 'private' },
    );
    expect(eventEmitterMock.emit).not.toHaveBeenCalled();
  });

  it('rejects new uploads when the image processing pool is saturated', async () => {
    const releaseStorage = createDeferred<void>();

    storageProviderMock.uploadPrivateStream.mockImplementation(async (file, path) => {
      await releaseStorage.promise;
      await readStream(file.stream as AsyncIterable<Buffer | Uint8Array>);
      return { key: path };
    });

    const inFlightUploads = Array.from(
      { length: UPLOAD_IMAGE_MAX_CONCURRENT_PROCESSING },
      (_, index) =>
        service.uploadImageStream(
          createUpload({
            originalname: `ride-${index}.png`,
          }),
          'user-1',
          'rides',
        ),
    );
    const rejectedUpload = createUpload({
      originalname: 'ride-overflow.png',
    });

    await expect(
      service.uploadImageStream(rejectedUpload, 'user-1', 'rides'),
    ).rejects.toThrow(
      new ServiceUnavailableException(
        'Muitos uploads de imagem estao em processamento no momento. Tente novamente em instantes.',
      ),
    );
    expect(rejectedUpload.cancel).toHaveBeenCalled();

    releaseStorage.resolve();

    await expect(Promise.all(inFlightUploads)).resolves.toHaveLength(
      UPLOAD_IMAGE_MAX_CONCURRENT_PROCESSING,
    );

    await expect(
      service.uploadImageStream(
        createUpload({
          originalname: 'ride-retry.png',
        }),
        'user-1',
        'rides',
      ),
    ).resolves.toEqual({
      key: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    });
  });
});
