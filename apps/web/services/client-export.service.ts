import { ridesService } from '@/services/rides-service';
import type { RideViewModel } from '@/types/rides';
import type {
  ClientExportResult,
  ClientExportSummary,
  ClientExportType,
} from './client-export.types';

interface ExportClientRidesParams {
  clientId: string;
  type: ClientExportType;
  startDate?: string;
  endDate?: string;
}

const CLIENT_EXPORT_PAGE_SIZE = 100;

function isExportableRide(ride: RideViewModel) {
  return ride.status !== 'CANCELLED';
}

function getPendingValue(ride: RideViewModel) {
  if (ride.paymentStatus !== 'PENDING' || ride.status === 'CANCELLED') {
    return 0;
  }

  return ride.debtValue ?? ride.value;
}

function buildSummary(rides: RideViewModel[]): ClientExportSummary {
  const totalValue = rides.reduce((sum, ride) => sum + ride.value, 0);
  const totalPending = rides.reduce((sum, ride) => sum + getPendingValue(ride), 0);
  const pendingRides = rides.filter((ride) => ride.paymentStatus === 'PENDING').length;

  return {
    totalRides: rides.length,
    pendingRides,
    totalValue,
    totalPaid: Math.max(totalValue - totalPending, 0),
    totalPending,
  };
}

function getPaymentStatus(type: ClientExportType) {
  if (type === 'all') {
    return undefined;
  }

  if (type === 'pending') {
    return 'PENDING' as const;
  }

  return 'PAID' as const;
}

export const clientExportService = {
  async exportClientRides({
    clientId,
    type,
    startDate,
    endDate,
  }: ExportClientRidesParams): Promise<ClientExportResult> {
    const rides: RideViewModel[] = [];
    let cursor: string | undefined;

    do {
      const response = await ridesService.getRidesByClient(clientId, {
        limit: CLIENT_EXPORT_PAGE_SIZE,
        cursor,
        paymentStatus: getPaymentStatus(type),
        startDate,
        endDate,
      });

      rides.push(...(response.data || []).filter(isExportableRide));
      cursor = response.meta?.hasNextPage ? response.meta.nextCursor : undefined;
    } while (cursor);

    const uniqueRides = Array.from(new Map(rides.map((ride) => [ride.id, ride])).values());

    return {
      type,
      rides: uniqueRides,
      summary: buildSummary(uniqueRides),
      dateRange:
        startDate && endDate
          ? {
              start: startDate,
              end: endDate,
            }
          : undefined,
    };
  },
};
