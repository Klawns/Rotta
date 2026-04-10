'use client';

import { useMutation } from '@tanstack/react-query';
import { parseApiError } from '@/lib/api-error';
import { useToast } from '@/hooks/use-toast';
import { exportRidesPdf } from '@/services/pdf-export.service';
import { ridesService } from '@/services/rides-service';
import type { FinancePeriod } from '@/services/finance-service';

export type MobilePdfExportPeriod = Extract<
  FinancePeriod,
  'today' | 'week' | 'month'
>;

interface UseExportRidesPdfParams {
  userName: string;
}

export function useExportRidesPdf({ userName }: UseExportRidesPdfParams) {
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (period: MobilePdfExportPeriod) => {
      const response = await ridesService.getStats({ period });

      return exportRidesPdf({
        rides: response.data.rides,
        expectedRideCount: response.data.count,
        period,
        userName: userName || 'Motorista',
      });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao exportar',
        description: parseApiError(error, 'Tente novamente.'),
        variant: 'destructive',
      });
    },
  });

  const activePeriod = mutation.isPending ? mutation.variables : null;
  const exportPeriod = async (period: MobilePdfExportPeriod) => {
    try {
      const result = await mutation.mutateAsync(period);

      if (!result.ok && result.reason === 'empty') {
        toast({ title: 'Sem dados para exportar' });
      }
      if (!result.ok && result.reason === 'missing-filtered-rides') {
        toast({
          title: 'Erro ao exportar',
          description: 'Nao foi possivel montar o PDF com as corridas do periodo.',
          variant: 'destructive',
        });
      }
    } catch {
      return undefined;
    }
  };

  return {
    exportPeriod,
    isExporting: mutation.isPending,
    activePeriod,
  };
}
