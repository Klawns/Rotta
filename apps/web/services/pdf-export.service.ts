import { getRidesPdfExportAvailability } from '@/mappers/pdf-export.mapper';
import {
  PDFService,
  type ExportOptions,
  type PDFReportRide,
} from '@/services/pdf-service';
import { sharePdfFile } from '@/services/pdf-file-share.service';

export type PdfExportMode = 'download' | 'share';

interface ExportRidesPdfInput extends ExportOptions {
  rides: PDFReportRide[];
  expectedRideCount?: number;
  mode?: PdfExportMode;
}

export async function exportRidesPdf({
  rides,
  expectedRideCount,
  mode = 'download',
  ...options
}: ExportRidesPdfInput) {
  const availability = getRidesPdfExportAvailability({
    rides,
    expectedRideCount,
  });

  if (!availability.ok) {
    return availability;
  }

  if (mode === 'share') {
    const file = await PDFService.createFinancialReportFile(rides, options);
    await sharePdfFile(file);
    return availability;
  }

  await PDFService.downloadFinancialReport(rides, options);

  return availability;
}
