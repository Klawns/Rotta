'use client';

import { useMemo } from 'react';
import { FinanceByStatus } from '@/services/finance-service';
import { paymentStatusChartService } from '../_services/payment-status-chart-service';

interface UsePaymentStatusChartParams {
  data: FinanceByStatus[];
}

export function usePaymentStatusChart({
  data,
}: UsePaymentStatusChartParams) {
  const chartData = useMemo(
    () => paymentStatusChartService.normalize(data),
    [data],
  );

  return {
    chartData,
    hasData: chartData.length > 0,
  };
}
