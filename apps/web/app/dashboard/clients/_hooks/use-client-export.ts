'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getDateRangeForRidePreset,
  normalizeRideDateRange,
} from '@/app/dashboard/rides/_lib/rides-filters';
import { useAuth } from '@/hooks/use-auth';
import { parseApiError } from '@/lib/api-error';
import { clientExportService } from '@/services/client-export.service';
import {
  getClientExportTypeLabel,
  isClientExportDateRangeRequired,
  type ClientExportType,
} from '@/services/client-export.types';
import { PDFService } from '@/services/pdf-service';
import type { Client } from '@/types/rides';

interface UseClientExportProps {
  client: Client | null;
  isDetailsPending: boolean;
}

interface ClientExportDateRangeState {
  startDate: string;
  endDate: string;
}

export interface ClientExportController {
  isOpen: boolean;
  selectedType: ClientExportType;
  dateRange: ClientExportDateRangeState;
  isExporting: boolean;
  isTriggerDisabled: boolean;
  isSubmitDisabled: boolean;
  errorMessage: string | null;
  openExport: (type: ClientExportType) => void;
  closeExport: () => void;
  setDateRange: (nextRange: ClientExportDateRangeState) => void;
  applyPreset: (preset: 'today' | '7d' | '30d' | 'month') => void;
  clearDateRange: () => void;
  submitExport: () => Promise<void>;
}

function getEmptyExportMessage(type: ClientExportType) {
  switch (type) {
    case 'paid':
      return 'Nenhuma corrida paga encontrada para o filtro selecionado.';
    case 'pending':
      return 'Nenhuma corrida pendente encontrada para o filtro selecionado.';
    case 'all':
    default:
      return 'Nenhuma corrida encontrada para o filtro selecionado.';
  }
}

export function useClientExport({
  client,
  isDetailsPending,
}: UseClientExportProps): ClientExportController {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedTypeState] = useState<ClientExportType>('all');
  const [dateRange, setDateRangeState] = useState<ClientExportDateRangeState>({
    startDate: '',
    endDate: '',
  });
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async ({
      clientId,
      clientName,
      type,
      startDate,
      endDate,
      userName,
    }: {
      clientId: string;
      clientName: string;
      type: ClientExportType;
      startDate?: string;
      endDate?: string;
      userName: string;
    }) => {
      const report = await clientExportService.exportClientRides({
        clientId,
        type,
        startDate,
        endDate,
      });

      if (report.rides.length === 0) {
        return report;
      }

      await PDFService.generateClientRidesReport(
        {
          id: clientId,
          name: clientName,
        },
        report.rides,
        report.summary,
        {
          userName,
          type,
          dateRange: report.dateRange,
        },
      );

      return report;
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao exportar PDF.'));
    },
  });

  useEffect(() => {
    setIsOpen(false);
    setSelectedTypeState('all');
    setDateRangeState({ startDate: '', endDate: '' });
    setValidationMessage(null);
    mutation.reset();
  }, [client?.id]);

  const hasPartialDate = Boolean(dateRange.startDate) !== Boolean(dateRange.endDate);

  const getValidationMessage = useCallback(() => {
    if (!client) {
      return 'Selecione um cliente para exportar.';
    }

    if (isDetailsPending) {
      return 'Aguarde o carregamento dos detalhes antes de exportar.';
    }

    if (hasPartialDate) {
      return 'Selecione data inicial e data final para continuar.';
    }

    if (
      isClientExportDateRangeRequired(selectedType) &&
      (!dateRange.startDate || !dateRange.endDate)
    ) {
      return 'Defina um período para exportar o PDF.';
    }

    return null;
  }, [
    client,
    dateRange.endDate,
    dateRange.startDate,
    hasPartialDate,
    isDetailsPending,
    selectedType,
  ]);

  const resetValidation = useCallback(() => {
    setValidationMessage(null);
  }, []);

  const setDateRange = useCallback(
    (nextRange: ClientExportDateRangeState) => {
      if (!nextRange.startDate || !nextRange.endDate) {
        setDateRangeState(nextRange);
        resetValidation();
        return;
      }

      setDateRangeState(
        normalizeRideDateRange(
          nextRange.startDate,
          nextRange.endDate,
          'end',
        ),
      );
      resetValidation();
    },
    [resetValidation],
  );

  const applyPreset = useCallback(
    (preset: 'today' | '7d' | '30d' | 'month') => {
      setDateRangeState(getDateRangeForRidePreset(preset));
      resetValidation();
    },
    [resetValidation],
  );

  const clearDateRange = useCallback(() => {
    setDateRangeState({ startDate: '', endDate: '' });
    resetValidation();
  }, [resetValidation]);

  const closeExport = useCallback(() => {
    if (mutation.isPending) {
      return;
    }

    setIsOpen(false);
    resetValidation();
    mutation.reset();
  }, [mutation, resetValidation]);

  const openExport = useCallback((type: ClientExportType) => {
    if (!client || isDetailsPending || mutation.isPending) {
      return;
    }

    setSelectedTypeState(type);
    setIsOpen(true);
    resetValidation();
  }, [client, isDetailsPending, mutation.isPending, resetValidation]);

  const submitExport = useCallback(async () => {
    const nextValidationMessage = getValidationMessage();

    if (nextValidationMessage) {
      setValidationMessage(nextValidationMessage);
      toast.error(nextValidationMessage);
      return;
    }

    if (!client) {
      return;
    }

    setValidationMessage(null);

    try {
      const result = await mutation.mutateAsync({
        clientId: client.id,
        clientName: client.name || 'Sem nome',
        type: selectedType,
        startDate: dateRange.startDate || undefined,
        endDate: dateRange.endDate || undefined,
        userName: user?.name || 'Motorista',
      });

      if (result.rides.length === 0) {
        toast.error(getEmptyExportMessage(selectedType));
        return;
      }

      toast.success(
        `PDF de ${getClientExportTypeLabel(selectedType).toLowerCase()} pronto. O download deve iniciar em instantes.`,
      );
      setIsOpen(false);
    } catch {
      return;
    }
  }, [
    client,
    dateRange.endDate,
    dateRange.startDate,
    getValidationMessage,
    mutation,
    selectedType,
    user?.name,
  ]);

  const errorMessage = useMemo(() => {
    if (validationMessage) {
      return validationMessage;
    }

    if (mutation.error) {
      return parseApiError(mutation.error, 'Erro ao exportar PDF.');
    }

    return null;
  }, [mutation.error, validationMessage]);

  return {
    isOpen,
    selectedType,
    dateRange,
    isExporting: mutation.isPending,
    isTriggerDisabled: !client || isDetailsPending || mutation.isPending,
    isSubmitDisabled:
      !client ||
      isDetailsPending ||
      mutation.isPending ||
      hasPartialDate ||
      !dateRange.startDate ||
      !dateRange.endDate,
    errorMessage,
    openExport,
    closeExport,
    setDateRange,
    applyPreset,
    clearDateRange,
    submitExport,
  };
}
