'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import {
  financeService,
  type FinanceDashboardParams,
} from '@/services/finance-service';
import { PDFService } from '@/services/pdf-service';

interface UseExportPdfParams {
  dashboardParams: FinanceDashboardParams | null;
  expectedRideCount: number;
  isFinanceDataPending: boolean;
  userName: string;
}

export function useExportPdf({
  dashboardParams,
  expectedRideCount,
  isFinanceDataPending,
  userName,
}: UseExportPdfParams) {
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPDF = async () => {
    if (isFinanceDataPending || isExportingPdf || !dashboardParams) {
      return;
    }

    setIsExportingPdf(true);

    try {
      const report = await financeService.getReport(dashboardParams);

      if (expectedRideCount > 0 && report.rides.length === 0) {
        throw new Error(
          'Nao foi possivel montar o PDF com as corridas do filtro atual.',
        );
      }

      await PDFService.generateReport(report.rides, {
        period: dashboardParams.period,
        userName,
        dateRange: report.period,
      });
    } catch (error) {
      toast.error(parseApiError(error, 'Erro ao exportar PDF.'));
    } finally {
      setIsExportingPdf(false);
    }
  };

  return {
    isExportingPdf,
    handleExportPDF,
  };
}
