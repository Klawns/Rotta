'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { parseApiError } from '@/lib/api-error';
import { authService } from '@/services/auth-service';
import type { AdminLoginCredentials } from '../_lib/admin-auth.types';
import { resolveAdminRedirect } from '../_lib/admin-auth.rules';
import { cleanupUnauthorizedAdminLogin } from '../_lib/cleanup-unauthorized-admin-login';
import {
  getAdminLoginPendingState,
  shouldRedirectWithAdminSessionGate,
} from '../_lib/admin-login-navigation';
import { syncAdminAuthQueryCache } from '../_lib/sync-admin-auth-query-cache';
import { useAdminSessionGate } from './use-admin-session-gate';
import {
  AdminAccessDeniedError,
  adminAuthService,
  isAdminAccessDeniedError,
} from '../_services/admin-auth.service';

const ADMIN_LOGIN_ERROR_MESSAGE = 'Erro no acesso administrativo.';

function getAdminLoginErrorMessage(error: unknown) {
  if (!error) {
    return null;
  }

  if (isAdminAccessDeniedError(error)) {
    return error.message;
  }

  return parseApiError(error, ADMIN_LOGIN_ERROR_MESSAGE);
}

export function useAdminLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { redirectTo, isCheckingSession } = useAdminSessionGate();
  const [isRedirectingAfterSubmit, setIsRedirectingAfterSubmit] =
    useState(false);
  const shouldRedirectWithSessionGate = shouldRedirectWithAdminSessionGate({
    isRedirectingAfterSubmit,
    redirectTo,
  });

  useEffect(() => {
    if (!shouldRedirectWithSessionGate || !redirectTo) {
      return;
    }

    router.replace(redirectTo);
  }, [redirectTo, router, shouldRedirectWithSessionGate]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: AdminLoginCredentials) => {
      const result = await adminAuthService.login(credentials);

      if (result.status === 'access-denied') {
        await cleanupUnauthorizedAdminLogin(
          queryClient,
          adminAuthService.logoutUnauthorizedAdminSession,
        );
        throw new AdminAccessDeniedError();
      }

      return result.user;
    },
    onSuccess: async (authenticatedUser) => {
      authService.resetRedirectLock();
      await syncAdminAuthQueryCache(queryClient, authenticatedUser);
    },
  });

  return {
    error: getAdminLoginErrorMessage(loginMutation.error),
    isSubmitting: loginMutation.isPending,
    isCheckingSession: getAdminLoginPendingState({
      isCheckingSession,
      isRedirectingAfterSubmit,
    }),
    submit(credentials: AdminLoginCredentials) {
      loginMutation.mutate(credentials, {
        onSuccess: (authenticatedUser) => {
          setIsRedirectingAfterSubmit(true);
          router.replace(resolveAdminRedirect(authenticatedUser.role));
        },
      });
    },
  };
}
