import type { PaymentStatus } from '@/types/rides';

export type RideCardFinancialState = 'paid' | 'pending' | 'partial' | 'debt';

export interface RideCardDetailItem {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'warning' | 'danger';
}

export interface RideCardPresentation {
  rideShortLabel: string;
  clientName: string;
  formattedValue: string;
  financialState: RideCardFinancialState;
  financialLabel: string;
  financialHelper: string | null;
  paymentStatus: PaymentStatus;
  paymentActionLabel: string;
  metaItems: string[];
  details: RideCardDetailItem[];
  notes: string | null;
}
