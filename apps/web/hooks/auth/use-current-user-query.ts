'use client';

import { useQuery } from '@tanstack/react-query';
import { authKeys } from '@/lib/query-keys';
import { apiClient } from '@/services/api';
import { type User } from '@/hooks/use-auth';

interface UseCurrentUserQueryOptions {
  enabled?: boolean;
}

export function useCurrentUserQuery(options?: UseCurrentUserQueryOptions) {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      try {
        return await apiClient.get<User>('/auth/me', { _skipRedirect: true });
      } catch {
        return null;
      }
    },
    staleTime: 1000 * 60 * 5,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}
