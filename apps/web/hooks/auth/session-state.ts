import { isApiErrorStatus } from '@/lib/api-error';
import type { User } from './auth.types';

interface ResolveAuthSessionStateInput {
  data?: User | null;
  error: unknown;
  isError: boolean;
  isLoading: boolean;
}

export interface AuthSessionState {
  user: User | null;
  isAuthenticated: boolean;
  isAuthError: boolean;
  authError: unknown | null;
  isLoading: boolean;
}

export function resolveAuthSessionState({
  data,
  error,
  isError,
  isLoading,
}: ResolveAuthSessionStateInput): AuthSessionState {
  if (isApiErrorStatus(error, 401)) {
    return {
      user: null,
      isAuthenticated: false,
      isAuthError: false,
      authError: null,
      isLoading,
    };
  }

  const user = data ?? null;
  const authError = isError && !user ? error : null;

  return {
    user,
    isAuthenticated: !!user,
    isAuthError: authError !== null,
    authError,
    isLoading,
  };
}
