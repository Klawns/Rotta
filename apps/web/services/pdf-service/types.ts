import jsPDF from 'jspdf';
import type {
  FinancePaymentStatus,
  FinancePeriod,
} from '@/services/finance-service';
import type {
  ClientExportDateRange,
  ClientExportSummary,
  ClientExportType,
} from '@/services/client-export.types';
import { type PaymentStatus, type RideStatus } from '@/types/rides';

export interface ExportOptions {
  clients?: string[];
  period: FinancePeriod;
  paymentStatus?: FinancePaymentStatus;
  userName: string;
  dateRange?: {
    start: string;
    end: string;
  };
  pixKey?: string;
}

export interface PDFReportRide {
  id: string;
  value: number;
  paymentStatus?: PaymentStatus;
  createdAt?: string;
  rideDate?: string;
  location?: string | null;
  clientName?: string | null;
  client?: {
    name: string;
  } | null;
  status?: RideStatus;
  paidWithBalance?: number;
  debtValue?: number;
}

export interface ClientReportOptions {
  userName: string;
  type: ClientExportType;
  dateRange?: ClientExportDateRange;
}

export type { ClientExportSummary };

export type AutoTableDoc = jsPDF & {
  lastAutoTable?: {
    finalY: number;
  };
};
