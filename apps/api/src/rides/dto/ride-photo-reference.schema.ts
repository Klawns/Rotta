import { z } from 'zod';

export const ridePhotoFilenamePattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;

export const managedRidePhotoKeyPattern =
  /^users\/[^/]+\/rides\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.webp$/i;

export const invalidRidePhotoReferenceMessage =
  'Foto invalida. Envie apenas uma referencia gerada pelo upload de corridas.';

export function normalizeRidePhotoReferenceValue(value: unknown) {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue = value.trim();

  return normalizedValue === '' ? null : normalizedValue;
}

export function isManagedRidePhotoKeyValue(
  photo?: string | null,
): photo is string {
  if (typeof photo !== 'string') {
    return false;
  }

  return managedRidePhotoKeyPattern.test(photo.trim());
}

export const controlledRidePhotoReferenceSchema = z.preprocess(
  normalizeRidePhotoReferenceValue,
  z
    .string()
    .regex(managedRidePhotoKeyPattern, invalidRidePhotoReferenceMessage)
    .nullable(),
);
