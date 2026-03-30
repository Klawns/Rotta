'use client';

import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { parseApiError } from '@/lib/api-error';
import { PDFService } from '@/services/pdf-service';
import { ridesService } from '@/services/rides-service';
import { type ClientPayment } from '@/types/client-payments';
import { type Client, type ClientBalance } from '@/types/rides';
import { useExportClientDebt } from './use-export-client-debt';

interface UseClientDetailsExportProps {
  client: Client | null;
  balance: ClientBalance | null;
  payments: ClientPayment[];
}

export function useClientDetailsExport({
  client,
  balance,
  payments,
}: UseClientDetailsExportProps) {
  const { user } = useAuth();
  const { exportToExcel } = useExportClientDebt();

  const exportMeta = useMemo(
    () => ({ userName: user?.name || 'Motorista' }),
    [user?.name],
  );

  const loadAllClientRides = useCallback(async () => {
    if (!client) {
      return [];
    }

    const allRides = [];
    let cursor: string | undefined;

    do {
      const response = await ridesService.getRidesByClient(client.id, {
        limit: 100,
        cursor,
      });

      allRides.push(...(response.data || []));
      cursor = response.meta?.hasNextPage ? response.meta.nextCursor : undefined;
    } while (cursor);

    return allRides;
  }, [client]);

  const generatePDF = useCallback(async () => {
    if (!client || !balance) {
      return;
    }

    try {
      const allRides = await loadAllClientRides();
      PDFService.generateClientDebtReport(
        client,
        allRides,
        payments,
        balance,
        exportMeta,
      );
    } catch (error) {
      toast.error(parseApiError(error, 'Erro ao gerar PDF.'));
    }
  }, [balance, client, exportMeta, loadAllClientRides, payments]);

  const generateExcel = useCallback(async () => {
    if (!client || !balance) {
      return;
    }

    try {
      const allRides = await loadAllClientRides();
      exportToExcel(client, allRides, payments, balance, exportMeta);
    } catch (error) {
      toast.error(parseApiError(error, 'Erro ao gerar planilha.'));
    }
  }, [balance, client, exportMeta, exportToExcel, loadAllClientRides, payments]);

  return {
    generatePDF,
    generateExcel,
  };
}
