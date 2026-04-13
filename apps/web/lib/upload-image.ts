const UPLOAD_IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

const UPLOAD_IMAGE_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

export const UPLOAD_IMAGE_ACCEPT =
  '.jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp';

export const UPLOAD_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024;

type UploadImageMimeType = (typeof UPLOAD_IMAGE_ALLOWED_MIME_TYPES)[number];
type UploadImageExtension = (typeof UPLOAD_IMAGE_ALLOWED_EXTENSIONS)[number];

const allowedMimeTypeSet = new Set<UploadImageMimeType>(
  UPLOAD_IMAGE_ALLOWED_MIME_TYPES,
);
const allowedExtensionSet = new Set<UploadImageExtension>(
  UPLOAD_IMAGE_ALLOWED_EXTENSIONS,
);

function getFileExtension(filename: string) {
  const extensionIndex = filename.lastIndexOf('.');

  if (extensionIndex < 0) {
    return '';
  }

  return filename.slice(extensionIndex).toLowerCase();
}

export function getUploadImageValidationError(file: File): string | undefined {
  const hasAllowedMimeType = allowedMimeTypeSet.has(
    file.type as UploadImageMimeType,
  );
  const hasAllowedExtension = allowedExtensionSet.has(
    getFileExtension(file.name) as UploadImageExtension,
  );

  if (!hasAllowedMimeType && !hasAllowedExtension) {
    return 'Envie apenas imagens JPG, PNG ou WEBP.';
  }

  if (file.size > UPLOAD_IMAGE_MAX_SIZE_BYTES) {
    return 'A imagem deve ter no maximo 5 MB.';
  }

  return undefined;
}
