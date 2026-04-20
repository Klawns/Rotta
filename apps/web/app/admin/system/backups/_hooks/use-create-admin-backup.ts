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
        title: 'Backup tecnico iniciado',
        description: 'O dump completo foi enviado para a fila.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Falha ao iniciar backup tecnico',
        description: parseApiError(
          error,
          'Nao foi possivel iniciar o backup tecnico agora. Tente novamente em instantes.',
        ),
        variant: 'destructive',
      });
    },
  });
}
