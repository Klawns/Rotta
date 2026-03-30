'use client';

import Link from 'next/link';
import { AuthLoadingScreen } from './auth-loading-screen';
import { AuthShell } from './auth-shell';
import { GoogleAuthButton } from './google-auth-button';
import { useLoginFlow } from '../hooks/use-login-flow';

export function LoginView() {
  const { isLoading, isAuthenticated, handleGoogleLogin } = useLoginFlow();

  if (isLoading || isAuthenticated) {
    return <AuthLoadingScreen />;
  }

  return (
    <AuthShell
      title="Bem-vindo ao Rotta"
      description="Acesse sua conta com Google para continuar gerenciando suas corridas com segurança."
      footer={
        <div className="flex flex-col items-center gap-4">
          <div className="text-slate-400">
            Não tem uma conta?{' '}
            <Link
              href="/register"
              className="font-bold text-blue-400 transition-colors hover:text-blue-300"
            >
              Cadastre-se
            </Link>
          </div>

          <Link
            href="/area-restrita"
            className="text-xs font-medium text-white/20 transition-colors hover:text-white/40"
          >
            Acesso Administrativo
          </Link>
        </div>
      }
    >
      <div className="space-y-4">
        <GoogleAuthButton onClick={handleGoogleLogin}>
          Entrar com Google
        </GoogleAuthButton>
      </div>
    </AuthShell>
  );
}
