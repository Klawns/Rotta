import { apiClient } from '@/services/api';

export interface FinanceDashboardParams {
  period: string;
  start?: string;
  end?: string;
  clientId?: string;
}

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

interface RawFinanceSummary {
  totalValue?: number | string | null;
  count?: number | string | null;
  ticketMedio?: number | string | null;
  previousPeriodComparison?: number | string | null;
  projection?: number | string | null;
}

interface RawFinanceTrend {
  date?: string | null;
  value?: number | string | null;
}

interface RawFinanceByClient {
  clientId?: string | null;
  clientName?: string | null;
  value?: number | string | null;
}

interface RawFinanceByStatus {
  status: FinanceByStatus['status'];
  value?: number | string | null;
}

interface RawRecentRide
  extends Omit<RecentRide, 'rideDate' | 'value' | 'clientName'> {
  rideDate: unknown;
  value: number | string | null;
  clientName: string | null;
}

interface RawFinanceDashboardData {
  summary?: RawFinanceSummary | null;
  trends?: RawFinanceTrend[] | null;
  byClient?: RawFinanceByClient[] | null;
  byStatus?: RawFinanceByStatus[] | null;
  recentRides?: RawRecentRide[] | null;
}

function normalizeNumber(value: number | string | null | undefined) {
  return Number(value || 0);
}

function normalizeRideDate(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }

  if (typeof value === 'number') {
    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? '' : parsedDate.toISOString();
  }

  return '';
}

function normalizeSummary(summary?: RawFinanceSummary | null): FinanceSummary {
  return {
    totalValue: normalizeNumber(summary?.totalValue),
    count: normalizeNumber(summary?.count),
    ticketMedio: normalizeNumber(summary?.ticketMedio),
    previousPeriodComparison: normalizeNumber(
      summary?.previousPeriodComparison,
    ),
    projection: normalizeNumber(summary?.projection),
  };
}

function normalizeTrend(item: RawFinanceTrend): FinanceTrend {
  return {
    date: item.date || '',
    value: normalizeNumber(item.value),
  };
}

function normalizeClient(item: RawFinanceByClient): FinanceByClient {
  return {
    clientId: item.clientId || '',
    clientName: item.clientName || '',
    value: normalizeNumber(item.value),
  };
}

function normalizeStatus(item: RawFinanceByStatus): FinanceByStatus {
  return {
    status: item.status,
    value: normalizeNumber(item.value),
  };
}

function normalizeRecentRide(ride: RawRecentRide): RecentRide {
  return {
    ...ride,
    value: normalizeNumber(ride.value),
    rideDate: normalizeRideDate(ride.rideDate),
    clientName: ride.clientName || '',
  };
}

function normalizeDashboardData(
  data: RawFinanceDashboardData,
): FinanceDashboardData {
  return {
    summary: normalizeSummary(data.summary),
    trends: (data.trends || []).map(normalizeTrend),
    byClient: (data.byClient || []).map(normalizeClient),
    byStatus: (data.byStatus || []).map(normalizeStatus),
    recentRides: (data.recentRides || []).map(normalizeRecentRide),
  };
}

export const financeService = {
  async getDashboard(
    params: FinanceDashboardParams,
    signal?: AbortSignal,
  ): Promise<FinanceDashboardData> {
    const data = await apiClient.get<RawFinanceDashboardData>(
      '/finance/dashboard',
      { params, signal },
    );

    return normalizeDashboardData(data);
  },
};

export default financeService;
