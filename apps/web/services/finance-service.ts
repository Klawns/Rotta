import { apiClient } from "@/services/api";

export interface FinanceSummary {
  totalValue: number;
  count: number;
  ticketMedio: number;
  previousPeriodComparison: number;
  projection: number;
}

export interface FinanceTrend {
  date: string;
  value: number;
}

export interface FinanceByClient {
  clientId: string;
  clientName: string;
  value: number;
}

export interface FinanceByStatus {
  status: 'PAID' | 'PENDING';
  value: number;
}

export interface RecentRide {
  id: string;
  value: number;
  rideDate: string;
  paymentStatus: 'PAID' | 'PENDING';
  location?: string;
  clientName: string;
}

export interface FinanceDashboardData {
  summary: FinanceSummary;
  trends: FinanceTrend[];
  byClient: FinanceByClient[];
  byStatus: FinanceByStatus[];
  recentRides: RecentRide[];
}

interface RawRecentRide extends Omit<RecentRide, "rideDate" | "value" | "clientName"> {
  rideDate: unknown;
  value: number | string | null;
  clientName: string | null;
}

function normalizeRideDate(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === "number") {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? "" : parsedDate.toISOString();
  }

  return "";
}

function normalizeRecentRide(ride: RawRecentRide): RecentRide {
  return {
    ...ride,
    value: Number(ride.value || 0),
    rideDate: normalizeRideDate(ride.rideDate),
    clientName: ride.clientName || "Cliente",
  };
}

export const financeService = {
  async getDashboard(params: {
    period: string;
    start?: string;
    end?: string;
    clientId?: string;
  }, signal?: AbortSignal): Promise<FinanceDashboardData> {
    const data = await apiClient.get<
      Omit<FinanceDashboardData, "recentRides"> & { recentRides: RawRecentRide[] }
    >("/finance/dashboard", { params, signal });

    return {
      ...data,
      recentRides: (data.recentRides || []).map(normalizeRecentRide),
    };
  },
};

export default financeService;
