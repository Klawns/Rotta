'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { PDFService } from '@/services/pdf-service';
import type { FinanceSummary, RecentRide } from '@/services/finance-service';
import type { PeriodId } from '../_types';

interface UseExportPdfParams {
  viewStats: FinanceSummary | null;
  rides: RecentRide[];
  selectedPeriod: PeriodId;
  userName: string;
}

interface ExportPayload {
  period: PeriodId;
  rides: RecentRide[];
}

export function useExportPdf({
  viewStats,
  rides,
  selectedPeriod,
  userName,
}: UseExportPdfParams) {
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pixKey, setPixKey] = useState('');
  const [statsToExport, setStatsToExport] = useState<ExportPayload | null>(
    null,
  );

  const handleExportPDF = () => {
    if (!viewStats || !rides.length) {
      return;
    }

    setStatsToExport({ period: selectedPeriod, rides });
    setIsPixModalOpen(true);
  };

  const confirmExport = async (includePix: boolean) => {
    if (!statsToExport) {
      return;
    }

    try {
      await PDFService.generateReport(statsToExport.rides, {
        period: statsToExport.period,
        userName,
        pixKey: includePix && pixKey.trim() ? pixKey : undefined,
      });
      setIsPixModalOpen(false);
      setStatsToExport(null);
    } catch (error) {
      toast.error(parseApiError(error, 'Erro ao exportar PDF.'));
    }
  };

  return {
    isPixModalOpen,
    setIsPixModalOpen,
    pixKey,
    setPixKey,
    handleExportPDF,
    confirmExport,
  };
}
