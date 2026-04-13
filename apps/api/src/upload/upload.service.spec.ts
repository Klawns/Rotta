const metadataMock = jest.fn();
const toBufferMock = jest.fn();

jest.mock('uuid', () => ({
  v4: jest.fn(() => '123e4567-e89b-42d3-a456-426614174000'),
}));

jest.mock('sharp', () =>
  jest.fn(() => ({
    metadata: metadataMock,
    rotate: jest.fn().mockReturnThis(),
    resize: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toBuffer: toBufferMock,
    once: jest.fn().mockReturnThis(),
  })),
);

import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import type { IStorageProvider } from '../storage/interfaces/storage-provider.interface';
import type { UploadImageBufferFile } from './upload-image.types';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;
  let storageProviderMock: jest.Mocked<
    Pick<IStorageProvider, 'upload' | 'uploadPrivate' | 'uploadPrivateStream'>
  >;
  let eventEmitterMock: {
    emit: jest.Mock;
  };

  beforeEach(() => {
    metadataMock.mockReset();
    metadataMock.mockResolvedValue({ format: 'png', width: 100, height: 100 });
    toBufferMock.mockReset();
    toBufferMock.mockResolvedValue(Buffer.from('processed-image'));

    storageProviderMock = {
      upload: jest.fn().mockResolvedValue({
        url: 'https://cdn.example.com/users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
        key: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      }),
      uploadPrivate: jest.fn().mockResolvedValue({
        key: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      }),
      uploadPrivateStream: jest.fn().mockResolvedValue({
        key: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      }),
    };

    eventEmitterMock = {
      emit: jest.fn(),
    };

    service = new UploadService(
      storageProviderMock as unknown as IStorageProvider,
      eventEmitterMock as unknown as EventEmitter2,
    );
  });

  function createUploadFile(
    overrides: Partial<UploadImageBufferFile> = {},
  ): UploadImageBufferFile {
    return {
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      mimetype: 'image/png',
      originalname: 'ride.png',
      size: 8,
      ...overrides,
    };
  }

  it('stores ride uploads in a user-scoped path', async () => {
    const file = createUploadFile({
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x00, 0x00, 0x00]),
    });

    const result = await service.uploadImage(file, 'user-1', 'rides');

    expect(storageProviderMock.uploadPrivateStream).toHaveBeenCalledWith(
      expect.objectContaining({
        mimetype: 'image/webp',
        originalname: 'ride.png',
      }),
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      { cacheControl: 'private, no-store', contentDisposition: 'inline' },
    );
    expect(eventEmitterMock.emit).toHaveBeenCalledWith(
      'image.uploaded',
      expect.objectContaining({
        key: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      }),
    );
    expect(result).toEqual({
      key: 'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    });
  });

  it('rejects images without valid dimensions', async () => {
    metadataMock.mockResolvedValueOnce({ format: 'png' });
    const file = createUploadFile();

    await expect(service.uploadImage(file, 'user-1', 'rides')).rejects.toThrow(
      new BadRequestException(
        'Arquivo invalido. A imagem precisa informar largura e altura validas.',
      ),
    );
    expect(storageProviderMock.uploadPrivateStream).not.toHaveBeenCalled();
  });

  it('rejects images that exceed the configured pixel limit', async () => {
    metadataMock.mockRejectedValueOnce(
      new Error('Input image exceeds pixel limit'),
    );
    const file = createUploadFile();

    await expect(service.uploadImage(file, 'user-1', 'rides')).rejects.toThrow(
      new BadRequestException(
        'Arquivo invalido. A imagem excede o limite de pixels permitido.',
      ),
    );
    expect(storageProviderMock.uploadPrivateStream).not.toHaveBeenCalled();
  });

  it('rejects files with an unsupported original extension', async () => {
    const file = createUploadFile({
      buffer: Buffer.from([0x47, 0x49, 0x46, 0x38]),
      mimetype: 'image/gif',
      originalname: 'ride.gif',
    });

    await expect(service.uploadImage(file, 'user-1', 'rides')).rejects.toThrow(
      new BadRequestException(
        'Arquivo invalido. Envie apenas imagens JPG, PNG ou WEBP.',
      ),
    );
    expect(storageProviderMock.uploadPrivateStream).not.toHaveBeenCalled();
  });

  it('rejects files whose decoded content is not a supported image', async () => {
    metadataMock.mockResolvedValueOnce({ format: 'gif' });
    const file = createUploadFile();

    await expect(service.uploadImage(file, 'user-1', 'rides')).rejects.toThrow(
      new BadRequestException(
        'Arquivo invalido. O conteudo nao e uma imagem suportada (JPG, PNG ou WEBP).',
      ),
    );
    expect(storageProviderMock.uploadPrivateStream).not.toHaveBeenCalled();
  });

  it('maps storage failures to service unavailable in the buffered rides path', async () => {
    storageProviderMock.uploadPrivateStream.mockRejectedValueOnce(
      new Error('storage unavailable'),
    );
    const file = createUploadFile();

    await expect(service.uploadImage(file, 'user-1', 'rides')).rejects.toThrow(
      new ServiceUnavailableException(
        'Nao foi possivel concluir o upload da imagem no momento. Tente novamente em instantes.',
      ),
    );
  });
});
