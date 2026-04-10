import type { PDFReportRide } from '@/services/pdf-service';

interface RidesPdfExportAvailabilityInput {
  rides: PDFReportRide[];
  expectedRideCount?: number;
}

export type RidesPdfExportAvailability =
  | {
      ok: true;
      ridesCount: number;
    }
  | {
      ok: false;
      reason: 'empty';
    }
  | {
      ok: false;
      reason: 'missing-filtered-rides';
      expectedRideCount: number;
    };

export function getRidesPdfExportAvailability({
  rides,
  expectedRideCount = 0,
}: RidesPdfExportAvailabilityInput): RidesPdfExportAvailability {
  if (rides.length > 0) {
    return {
      ok: true,
      ridesCount: rides.length,
    };
  }

  if (expectedRideCount > 0) {
    return {
      ok: false,
      reason: 'missing-filtered-rides',
      expectedRideCount,
    };
  }

  return {
    ok: false,
    reason: 'empty',
  };
}
