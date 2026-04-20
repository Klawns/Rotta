'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/api-error';
import { adminKeys } from '@/lib/query-keys';
import { adminBackupsService } from '@/services/admin-backups.service';
import type { UpdateSystemBackupSettingsDto } from '../_types/admin-backups.types';

export function useUpdateAdminBackupSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSystemBackupSettingsDto) =>
      adminBackupsService.updateSystemBackupSettings(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: adminKeys.systemBackupSettings(),
        }),
        queryClient.invalidateQueries({
          queryKey: adminKeys.technicalBackups(),
        }),
      ]);
      toast({
        title: 'Configuracao atualizada',
        description: 'Scheduler e retencao foram reaplicados.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Falha ao salvar configuracao',
        description: parseApiError(
          error,
          'Nao foi possivel salvar a configuracao do backup sistemico.',
        ),
        variant: 'destructive',
      });
    },
  });
}
