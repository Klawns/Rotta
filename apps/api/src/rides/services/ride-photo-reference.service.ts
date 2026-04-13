import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { IStorageProvider } from '../../storage/interfaces/storage-provider.interface';
import { STORAGE_PROVIDER } from '../../storage/interfaces/storage-provider.interface';
import {
  invalidRidePhotoReferenceMessage,
  isManagedRidePhotoKeyValue,
  ridePhotoFilenamePattern,
} from '../dto/ride-photo-reference.schema';

@Injectable()
export class RidePhotoReferenceService {
  private static readonly signedUrlExpiresInSeconds = 300;
  private readonly logger = new Logger(RidePhotoReferenceService.name);

  constructor(
    @Inject(STORAGE_PROVIDER)
    private readonly storageProvider: IStorageProvider,
  ) {}

  async validateForCreate(userId: string, photo?: string | null) {
    if (photo === undefined) {
      return undefined;
    }

    return this.validateControlledReference(userId, photo);
  }

  async validateForUpdate(
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

  private async validateControlledReference(userId: string, photo: string | null) {
    if (photo === null) {
      return null;
    }

    const normalizedPhoto = photo.trim();

    if (!normalizedPhoto) {
      return null;
    }

    const expectedPrefix = `users/${userId}/rides/`;

    if (!normalizedPhoto.startsWith(expectedPrefix)) {
      throw new BadRequestException(invalidRidePhotoReferenceMessage);
    }

    const fileName = normalizedPhoto.slice(expectedPrefix.length);

    if (!ridePhotoFilenamePattern.test(fileName)) {
      throw new BadRequestException(invalidRidePhotoReferenceMessage);
    }

    const exists = await this.storageProvider.exists(normalizedPhoto, {
      visibility: 'private',
    });

    if (!exists) {
      throw new BadRequestException(
        'Foto invalida. A referencia informada nao corresponde a um upload disponivel.',
      );
    }

    return normalizedPhoto;
  }

  isManagedPhotoKey(photo?: string | null): photo is string {
    return isManagedRidePhotoKeyValue(photo);
  }

  private logResponsePhotoResolutionFailure(photo: string, error: unknown) {
    const message =
      error instanceof Error ? error.message : 'erro desconhecido';

    this.logger.warn(
      `Falha ao resolver foto gerenciada para resposta: ${photo}. Motivo: ${message}`,
    );
  }

  async resolveForResponse(photo?: string | null) {
    if (photo === undefined) {
      return null;
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

    let exists: boolean;

    try {
      exists = await this.storageProvider.exists(normalizedPhoto, {
        visibility: 'private',
      });
    } catch (error) {
      this.logResponsePhotoResolutionFailure(normalizedPhoto, error);
      return null;
    }

    if (!exists) {
      this.logger.warn(
        `Referencia de foto gerenciada sem objeto correspondente no storage: ${normalizedPhoto}`,
      );
      return null;
    }

    try {
      return await this.storageProvider.getSignedUrl(normalizedPhoto, {
        expiresInSeconds: RidePhotoReferenceService.signedUrlExpiresInSeconds,
        visibility: 'private',
      });
    } catch (error) {
      this.logResponsePhotoResolutionFailure(normalizedPhoto, error);
      return null;
    }
  }

  async deleteManagedPhoto(photo: string) {
    await this.storageProvider.delete(photo, {
      visibility: 'private',
    });
  }
}
