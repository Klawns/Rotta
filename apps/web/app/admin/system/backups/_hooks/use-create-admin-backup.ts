'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { parseApiError } from '@/lib/api-error';
import { adminKeys } from '@/lib/query-keys';
import { adminBackupsService } from '@/services/admin-backups.service';

export function useCreateAdminBackup() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => adminBackupsService.createManualTechnicalBackup(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.technicalBackups(),
      });
      toast({
        title: 'Backup técnico iniciado',
        description: 'O dump completo foi enviado para a fila.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Falha ao iniciar backup técnico',
        description: parseApiError(
          error,
          'Não foi possível iniciar o backup técnico agora. Tente novamente em instantes.',
        ),
        variant: 'destructive',
      });
    },
  });
}
