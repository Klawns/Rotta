'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsKeys } from '@/lib/query-keys';
import { settingsService } from '@/services/settings-service';

interface UseDeleteRidePresetMutationOptions {
  onSuccess?: (presetId: string) => Promise<void> | void;
  onError?: (error: unknown, presetId: string) => Promise<void> | void;
}

export function useDeleteRidePresetMutation(
  options?: UseDeleteRidePresetMutationOptions,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (presetId: string) => settingsService.deleteRidePreset(presetId),
    onSuccess: async (_, presetId) => {
      await queryClient.invalidateQueries({ queryKey: settingsKeys.presets() });
      await options?.onSuccess?.(presetId);
    },
    onError: async (error, presetId) => {
      await options?.onError?.(error, presetId);
    },
  });
}
