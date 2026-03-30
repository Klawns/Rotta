import { FinanceByStatus } from '@/services/finance-service';

export interface PaymentStatusChartDatum extends FinanceByStatus {
  label: string;
  fill: string;
}
