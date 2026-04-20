import type { PaymentPlan } from '@/types/payments';

export type AdminBillingGatewayStatus = 'enabled' | 'readOnly' | 'unavailable';

export interface AdminBillingGatewayCapability {
  status: AdminBillingGatewayStatus;
  provider: string | null;
  message: string | null;
}

export interface AdminBillingSummaryMetrics {
  activePlans: number | null;
  highlightedPlanName: string | null;
  monthlyRevenueInCents: number | null;
  annualRevenueInCents?: number | null;
}

export interface AdminBillingSummary {
  gateway: AdminBillingGatewayCapability;
  metrics: AdminBillingSummaryMetrics;
}

export type AdminBillingPlan = PaymentPlan;
