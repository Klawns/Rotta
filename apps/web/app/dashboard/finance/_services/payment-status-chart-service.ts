import { FinanceByStatus } from '@/services/finance-service';
import { PaymentStatusChartDatum } from '../_types/payment-status-chart';

const STATUS_STYLES: Record<
  FinanceByStatus['status'],
  { label: string; color: string }
> = {
  PAID: {
    label: 'Pago',
    color: 'var(--color-success)',
  },
  PENDING: {
    label: 'Pendente',
    color: 'var(--color-warning)',
  },
};

export const paymentStatusChartService = {
  normalize(data: FinanceByStatus[]): PaymentStatusChartDatum[] {
    return data.map((item) => ({
      ...item,
      label: STATUS_STYLES[item.status].label,
      fill: STATUS_STYLES[item.status].color,
    }));
  },
};
