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

export const financeService = {
  async getDashboard(params: {
    period: string;
    start?: string;
    end?: string;
    clientId?: string;
  }, signal?: AbortSignal): Promise<FinanceDashboardData> {
    return apiClient.get("/finance/dashboard", { params, signal });
  },
};

export default financeService;
