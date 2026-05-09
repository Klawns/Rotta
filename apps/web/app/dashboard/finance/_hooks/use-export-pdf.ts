'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import {
  financeService,
  type FinanceDashboardParams,
} from '@/services/finance-service';
import {
  exportRidesPdf,
  type PdfExportMode,
} from '@/services/pdf-export.service';

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
  const mutation = useMutation({
    mutationFn: async ({
      currentDashboardParams,
      currentExpectedRideCount,
      mode,
    }: {
      currentDashboardParams: FinanceDashboardParams;
      currentExpectedRideCount: number;
      mode: PdfExportMode;
    }) => {
      const report = await financeService.getReport(currentDashboardParams);

      return exportRidesPdf({
        rides: report.rides,
        expectedRideCount: currentExpectedRideCount,
        mode,
        period: currentDashboardParams.period,
        paymentStatus: currentDashboardParams.paymentStatus,
        userName,
        dateRange: report.period,
      });
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao exportar PDF.'));
    },
  });

  const exportFinancialReport = async (mode: PdfExportMode) => {
    if (isFinanceDataPending || mutation.isPending || !dashboardParams) {
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        currentDashboardParams: dashboardParams,
        currentExpectedRideCount: expectedRideCount,
        mode,
      });

      if (!result.ok && result.reason === 'missing-filtered-rides') {
        toast.error(
          'Não foi possível montar o PDF com as corridas do filtro atual.',
        );
      }

      if (!result.ok && result.reason === 'empty') {
        toast.error('Sem dados para exportar no período selecionado.');
      }
    } catch {
      return;
    }
  };

  const downloadFinancialReport = () => exportFinancialReport('download');
  const shareFinancialReport = () => exportFinancialReport('share');

  return {
    isExportingPdf: mutation.isPending,
    downloadFinancialReport,
    shareFinancialReport,
    handleExportPDF: downloadFinancialReport,
  };
}
