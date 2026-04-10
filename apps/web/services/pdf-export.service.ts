import { getRidesPdfExportAvailability } from '@/mappers/pdf-export.mapper';
import {
  PDFService,
  type ExportOptions,
  type PDFReportRide,
} from '@/services/pdf-service';

interface ExportRidesPdfInput extends ExportOptions {
  rides: PDFReportRide[];
  expectedRideCount?: number;
}

export async function exportRidesPdf({
  rides,
  expectedRideCount,
  ...options
}: ExportRidesPdfInput) {
  const availability = getRidesPdfExportAvailability({
    rides,
    expectedRideCount,
  });

  if (!availability.ok) {
    return availability;
  }

  await PDFService.generateReport(rides, options);

  return availability;
}
