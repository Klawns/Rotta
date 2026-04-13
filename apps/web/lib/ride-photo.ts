export type RidePhotoState =
  | { kind: 'empty' }
  | { kind: 'existing'; url: string }
  | { kind: 'new'; file: File; previewUrl: string };

export function createRidePhotoState(photoUrl?: string | null): RidePhotoState {
  const normalizedPhotoUrl = photoUrl?.trim();

  if (!normalizedPhotoUrl) {
    return { kind: 'empty' };
  }

  return {
    kind: 'existing',
    url: normalizedPhotoUrl,
  };
}

export function createNewRidePhotoState(file: File): RidePhotoState {
  return {
    kind: 'new',
    file,
    previewUrl: URL.createObjectURL(file),
  };
}

export function getRidePhotoPreviewUrl(photo: RidePhotoState): string | null {
  switch (photo.kind) {
    case 'existing':
      return photo.url;
    case 'new':
      return photo.previewUrl;
    default:
      return null;
  }
}

export function hasRidePhoto(photo: RidePhotoState) {
  return photo.kind !== 'empty';
}

export function revokeRidePhotoPreview(photo: RidePhotoState) {
  if (photo.kind === 'new') {
    URL.revokeObjectURL(photo.previewUrl);
  }
}
