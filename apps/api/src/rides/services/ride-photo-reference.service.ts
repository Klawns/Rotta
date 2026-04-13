import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { IStorageProvider } from '../../storage/interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';

const RIDE_PHOTO_FILENAME_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;
const MANAGED_RIDE_PHOTO_KEY_PATTERN =
  /^users\/[^/]+\/rides\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;

@Injectable()
export class RidePhotoReferenceService {
  private static readonly signedUrlExpiresInSeconds = 300;

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  validateForCreate(userId: string, photo?: string | null) {
    if (photo === undefined) {
      return undefined;
    }

    return this.validateControlledReference(userId, photo);
  }

  validateForUpdate(
    userId: string,
    nextPhoto: string | null | undefined,
    currentPhoto: string | null,
  ) {
    if (nextPhoto === undefined) {
      return undefined;
    }

    if (nextPhoto === currentPhoto) {
      return nextPhoto;
    }

    return this.validateControlledReference(userId, nextPhoto);
  }

  private validateControlledReference(userId: string, photo: string | null) {
    if (photo === null) {
      return null;
    }

    const normalizedPhoto = photo.trim();

    if (!normalizedPhoto) {
      return null;
    }

    const expectedPrefix = `users/${userId}/rides/`;

    if (!normalizedPhoto.startsWith(expectedPrefix)) {
      throw new BadRequestException(
        'Foto invalida. Envie apenas uma referencia gerada pelo upload de corridas.',
      );
    }

    const fileName = normalizedPhoto.slice(expectedPrefix.length);

    if (!RIDE_PHOTO_FILENAME_PATTERN.test(fileName)) {
      throw new BadRequestException(
        'Foto invalida. Envie apenas uma referencia gerada pelo upload de corridas.',
      );
    }

    return normalizedPhoto;
  }

  isManagedPhotoKey(photo?: string | null): photo is string {
    if (typeof photo !== 'string') {
      return false;
    }

    const normalizedPhoto = photo.trim();

    return MANAGED_RIDE_PHOTO_KEY_PATTERN.test(normalizedPhoto);
  }

  async resolveForResponse(photo?: string | null) {
    if (photo === undefined) {
      return undefined;
    }

    if (photo === null) {
      return null;
    }

    const normalizedPhoto = photo.trim();

    if (!normalizedPhoto) {
      return null;
    }

    if (!this.isManagedPhotoKey(normalizedPhoto)) {
      return normalizedPhoto;
    }

    return this.storageProvider.getSignedUrl(normalizedPhoto, {
      expiresInSeconds: RidePhotoReferenceService.signedUrlExpiresInSeconds,
      visibility: 'private',
    });
  }

  async deleteManagedPhoto(photo: string) {
    await this.storageProvider.delete(photo, {
      visibility: 'private',
    });
  }
}
