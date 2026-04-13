import { BadRequestException } from '@nestjs/common';
import { RidePhotoReferenceService } from './ride-photo-reference.service';

describe('RidePhotoReferenceService', () => {
  let service: RidePhotoReferenceService;
  let storageProviderMock: {
    exists: jest.Mock;
    getSignedUrl: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(() => {
    storageProviderMock = {
      exists: jest.fn().mockResolvedValue(true),
      getSignedUrl: jest
        .fn()
        .mockResolvedValue('https://signed.example.com/ride-photo'),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    service = new RidePhotoReferenceService(storageProviderMock as any);
  });

  it('accepts a rides upload key for the same user', async () => {
    const photo = await service.validateForCreate(
      'user-1',
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    );

    expect(photo).toBe(
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    );
  });

  it('rejects a public photo URL', async () => {
    await expect(
      service.validateForCreate(
        'user-1',
        'https://cdn.example.com/users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a rides upload key from another user', async () => {
    await expect(
      service.validateForCreate(
        'user-1',
        'users/user-2/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects a same-user key when the asset does not exist in storage', async () => {
    storageProviderMock.exists.mockResolvedValueOnce(false);

    await expect(
      service.validateForCreate(
        'user-1',
        'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      ),
    ).rejects.toThrow(
      new BadRequestException(
        'Foto invalida. A referencia informada nao corresponde a um upload disponivel.',
      ),
    );
  });

  it('allows a legacy photo to remain unchanged during update', async () => {
    const legacyPhoto = 'https://legacy.example.com/photo.jpg';

    await expect(
      service.validateForUpdate('user-1', legacyPhoto, legacyPhoto),
    ).resolves.toBe(legacyPhoto);
  });

  it('resolves a managed ride photo key to a signed URL', async () => {
    await expect(
      service.resolveForResponse(
        'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      ),
    ).resolves.toBe('https://signed.example.com/ride-photo');

    expect(storageProviderMock.getSignedUrl).toHaveBeenCalledWith(
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      {
        expiresInSeconds: 300,
        visibility: 'private',
      },
    );
  });

  it('keeps a legacy public URL unchanged on response', async () => {
    await expect(
      service.resolveForResponse('https://legacy.example.com/photo.jpg'),
    ).resolves.toBe('https://legacy.example.com/photo.jpg');

    expect(storageProviderMock.getSignedUrl).not.toHaveBeenCalled();
  });

  it('returns null for a managed key that no longer exists in storage', async () => {
    storageProviderMock.exists.mockResolvedValueOnce(false);

    await expect(
      service.resolveForResponse(
        'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      ),
    ).resolves.toBeNull();

    expect(storageProviderMock.getSignedUrl).not.toHaveBeenCalled();
  });

  it('returns null when checking the managed key in storage fails operationally', async () => {
    storageProviderMock.exists.mockRejectedValueOnce(
      new Error('R2 temporarily unavailable'),
    );

    await expect(
      service.resolveForResponse(
        'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      ),
    ).resolves.toBeNull();

    expect(storageProviderMock.getSignedUrl).not.toHaveBeenCalled();
  });

  it('returns null when generating the signed URL fails operationally', async () => {
    storageProviderMock.getSignedUrl.mockRejectedValueOnce(
      new Error('Failed to sign URL'),
    );

    await expect(
      service.resolveForResponse(
        'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      ),
    ).resolves.toBeNull();
  });

  it('normalizes an undefined photo to null on response', async () => {
    await expect(service.resolveForResponse(undefined)).resolves.toBeNull();

    expect(storageProviderMock.getSignedUrl).not.toHaveBeenCalled();
  });

  it('deletes a managed ride photo using private visibility', async () => {
    await service.deleteManagedPhoto(
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
    );

    expect(storageProviderMock.delete).toHaveBeenCalledWith(
      'users/user-1/rides/123e4567-e89b-42d3-a456-426614174000.webp',
      { visibility: 'private' },
    );
  });
});
