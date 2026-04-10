import type { QueryClient } from '@tanstack/react-query';

import { authKeys } from '@/lib/query-keys';
import type { User } from './auth.types';

type AuthCacheWriter = Pick<QueryClient, 'setQueryData'>;

export function markAuthTutorialSeen(queryClient: AuthCacheWriter): void {
  queryClient.setQueryData<User | null>(authKeys.user(), (currentUser) =>
    currentUser ? { ...currentUser, hasSeenTutorial: true } : currentUser,
  );
}
