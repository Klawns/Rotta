'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminKeys } from '@/lib/query-keys';
import { adminSystemService } from '@/services/admin-system.service';
import type { UpdateAdminConfigInput } from '@/types/admin';

export function useAdminConfigs() {
  const queryClient = useQueryClient();

  const configsQuery = useQuery({
    queryKey: adminKeys.configs(),
    queryFn: ({ signal }) => adminSystemService.getConfigs(signal),
  });

  const updateConfigMutation = useMutation({
    mutationFn: (inputs: UpdateAdminConfigInput[]) =>
      adminSystemService.updateConfigs(inputs),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.configs() });
    },
  });

  return {
    configs: configsQuery.data ?? {},
    hasLoadedConfigs: configsQuery.data !== undefined,
    isLoading: configsQuery.isLoading,
    error: configsQuery.error,
    refetch: configsQuery.refetch,
    isSaving: updateConfigMutation.isPending,
    saveConfigs: updateConfigMutation.mutateAsync,
  };
}
