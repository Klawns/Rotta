'use client';

import type { ReactNode } from 'react';

import { QueryErrorState } from '@/components/query-error-state';
import { useAuth } from '@/hooks/use-auth';
import { useAdminAccess } from '../_hooks/use-admin-access';
import { AdminLoadingState } from './admin-ui';

interface AdminAccessGateProps {
  children: ReactNode;
}

export function AdminAccessGate({ children }: AdminAccessGateProps) {
  const { verify } = useAuth();
  const { isAdmin, isLoading, isAuthError, authError } = useAdminAccess();

  if (isAuthError && authError) {
    return (
      <div className="light admin-shell admin-shell-state">
        <QueryErrorState
          error={authError}
          title="Nao foi possivel validar o acesso administrativo"
          description="A sessao nao foi confirmada por uma falha operacional. Tente novamente."
          onRetry={() => {
            void verify();
          }}
          fullHeight
        />
      </div>
    );
  }

  if (isLoading || !isAdmin) {
    return (
      <div className="light admin-shell admin-shell-state">
        <AdminLoadingState
          title="Validando acesso restrito"
          description="Conferindo a sessao administrativa antes de liberar o shell."
        />
      </div>
    );
  }

  return <>{children}</>;
}
