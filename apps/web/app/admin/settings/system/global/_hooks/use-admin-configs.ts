'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { parseApiError } from '@/lib/api-error';
import { adminKeys } from '@/lib/query-keys';
import { adminService } from '@/services/admin-service';

export function useAdminConfigs() {
  const queryClient = useQueryClient();

  const configsQuery = useQuery({
    queryKey: adminKeys.configs(),
    queryFn: ({ signal }) => adminService.getConfigs(signal),
  });

  const updateConfigMutation = useMutation({
    mutationFn: adminService.updateConfig,
    onSuccess: async (_data, variables) => {
      toast.success(`${variables.key} atualizado!`);
      await queryClient.invalidateQueries({ queryKey: adminKeys.configs() });
    },
    onError: (error) => {
      toast.error(parseApiError(error, 'Erro ao salvar'));
    },
  });

  return {
    configs: configsQuery.data ?? {},
    isLoading: configsQuery.isLoading,
    isSaving: updateConfigMutation.isPending,
    updateConfig: updateConfigMutation.mutate,
  };
}
