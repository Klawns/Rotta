export type PdfShareResult = 'shared' | 'downloaded';

type DownloadPdfFile = (file: File) => void;

export function downloadPdfFile(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');

  link.href = url;
  link.download = file.name;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function sharePdfFile(
  file: File,
  fallbackDownload: DownloadPdfFile = downloadPdfFile,
): Promise<PdfShareResult> {
  const files = [file];

  if (!canSharePdfFiles(files)) {
    fallbackDownload(file);
    return 'downloaded';
  }

  try {
    await navigator.share({ files, title: file.name });
    return 'shared';
  } catch {
    fallbackDownload(file);
    return 'downloaded';
  }
}

function canSharePdfFiles(files: File[]) {
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.share !== 'function'
  ) {
    return false;
  }

  if (typeof navigator.canShare !== 'function') {
    return false;
  }

  return navigator.canShare({ files });
}
