'use client';

import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { parseApiError } from '@/lib/api-error';
import { PDFService } from '@/services/pdf-service';
import { ridesService } from '@/services/rides-service';
import { type ClientPayment } from '@/types/client-payments';
import { type Client, type ClientBalance, type RideViewModel } from '@/types/rides';
import { useExportClientDebt } from './use-export-client-debt';

interface UseClientDetailsExportProps {
  client: Client | null;
  rides: RideViewModel[];
  balance: ClientBalance | null;
  payments: ClientPayment[];
  isDetailsPending: boolean;
}

export function useClientDetailsExport({
  client,
  rides,
  balance,
  payments,
  isDetailsPending,
}: UseClientDetailsExportProps) {
  const { user } = useAuth();
  const { exportToExcel } = useExportClientDebt();
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const exportMeta = useMemo(
    () => ({ userName: user?.name || 'Motorista' }),
    [user?.name],
  );

  const loadPendingClientRides = useCallback(async () => {
    if (!client) {
      return [];
    }

    const pendingRides: RideViewModel[] = [];
    let cursor: string | undefined;

    do {
      const response = await ridesService.getRidesByClient(client.id, {
        limit: 100,
        cursor,
        paymentStatus: 'PENDING',
      });

      pendingRides.push(
        ...(response.data || []).filter((ride) => ride.status !== 'CANCELLED'),
      );
      cursor = response.meta?.hasNextPage ? response.meta.nextCursor : undefined;
    } while (cursor);

    return pendingRides;
  }, [client]);

  const generatePDF = useCallback(async () => {
    if (!client || !balance || isDetailsPending || isExportingPdf) {
      return;
    }

    setIsExportingPdf(true);

    try {
      const pendingRides = await loadPendingClientRides();

      if (balance.pendingRides > 0 && pendingRides.length === 0) {
        throw new Error(
          'Nao foi possivel montar o PDF com as corridas pendentes do cliente.',
        );
      }

      await PDFService.generateClientDebtReport(
        client,
        pendingRides,
        balance,
        exportMeta,
      );
    } catch (error) {
      toast.error(parseApiError(error, 'Erro ao gerar PDF.'));
    } finally {
      setIsExportingPdf(false);
    }
  }, [
    balance,
    client,
    exportMeta,
    isDetailsPending,
    isExportingPdf,
    loadPendingClientRides,
  ]);

  const generateExcel = useCallback(async () => {
    if (!client || !balance || isDetailsPending || isExportingExcel) {
      return;
    }

    setIsExportingExcel(true);

    try {
      exportToExcel(client, rides, payments, balance, exportMeta);
    } catch (error) {
      toast.error(parseApiError(error, 'Erro ao gerar planilha.'));
    } finally {
      setIsExportingExcel(false);
    }
  }, [
    balance,
    client,
    exportMeta,
    exportToExcel,
    isDetailsPending,
    isExportingExcel,
    payments,
    rides,
  ]);

  return {
    isExportingPdf,
    isExportingExcel,
    generatePDF,
    generateExcel,
  };
}
