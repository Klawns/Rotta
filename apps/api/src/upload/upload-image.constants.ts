import { extname } from 'node:path';

export const UPLOAD_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;
export const UPLOAD_IMAGE_MAX_INPUT_PIXELS = 40_000_000;
export const UPLOAD_IMAGE_MAX_CONCURRENT_PROCESSING = 4;
export const UPLOAD_IMAGE_ROUTE_THROTTLE_LIMIT = 10;
export const UPLOAD_IMAGE_ROUTE_THROTTLE_TTL_MS = 60_000;

export const UPLOAD_IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const UPLOAD_IMAGE_ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
] as const;

export const UPLOAD_IMAGE_ALLOWED_FORMATS = ['jpeg', 'png', 'webp'] as const;
export const UPLOAD_IMAGE_ALLOWED_FOLDERS = [
  'images',
  'avatars',
  'posts',
  'thumbnails',
  'rides',
] as const;
export const DEFAULT_UPLOAD_IMAGE_FOLDER = 'images';
export const INVALID_UPLOAD_IMAGE_FOLDER_MESSAGE =
  'Pasta de upload inválida. Use images, avatars, posts, thumbnails ou rides.';

export const UPLOAD_IMAGE_FILE_TYPE_PATTERN = /^image\/(jpeg|png|webp)$/i;

type UploadImageMimeType = (typeof UPLOAD_IMAGE_ALLOWED_MIME_TYPES)[number];
type UploadImageExtension = (typeof UPLOAD_IMAGE_ALLOWED_EXTENSIONS)[number];
export type UploadImageFormat = (typeof UPLOAD_IMAGE_ALLOWED_FORMATS)[number];
export type UploadImageFolder = (typeof UPLOAD_IMAGE_ALLOWED_FOLDERS)[number];

const allowedMimeTypeSet = new Set<UploadImageMimeType>(
  UPLOAD_IMAGE_ALLOWED_MIME_TYPES,
);
const allowedExtensionSet = new Set<UploadImageExtension>(
  UPLOAD_IMAGE_ALLOWED_EXTENSIONS,
);
const allowedFormatSet = new Set<UploadImageFormat>(
  UPLOAD_IMAGE_ALLOWED_FORMATS,
);
const allowedFolderSet = new Set<UploadImageFolder>(
  UPLOAD_IMAGE_ALLOWED_FOLDERS,
);

export function isAllowedUploadImageMimeType(
  mimetype: string | undefined,
): mimetype is UploadImageMimeType {
  return allowedMimeTypeSet.has(mimetype as UploadImageMimeType);
}

export function hasAllowedUploadImageExtension(originalname: string): boolean {
  return allowedExtensionSet.has(
    extname(originalname).toLowerCase() as UploadImageExtension,
  );
}

export function isAllowedUploadImageFormat(
  format: string | undefined,
): format is UploadImageFormat {
  return allowedFormatSet.has(format as UploadImageFormat);
}

export function isAllowedUploadImageFolder(
  folder: string | undefined,
): folder is UploadImageFolder {
  return allowedFolderSet.has(folder as UploadImageFolder);
}
