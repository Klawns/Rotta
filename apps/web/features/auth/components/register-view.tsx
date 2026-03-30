'use client';

import Link from 'next/link';
import { Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AuthShell } from './auth-shell';
import { GoogleAuthButton } from './google-auth-button';
import { useRegisterFlow } from '../hooks/use-register-flow';

export function RegisterView() {
  const {
    form,
    plan,
    canContinueWithGoogle,
    isCellphoneValidated,
    handleCellphoneChange,
    handleCellphoneRegister,
    handleGoogleRegister,
  } = useRegisterFlow();

  return (
    <AuthShell
      title="Cadastre-se no Rotta"
      description="Informe seu celular para liberar o cadastro com Google e iniciar seu plano com segurança."
      footer={
        <div className="text-center text-slate-400">
          Já tem uma conta?{' '}
          <Link
            href="/login"
            className="font-bold text-blue-400 transition-colors hover:text-blue-300"
          >
            Entrar agora
          </Link>
        </div>
      }
    >
      <form onSubmit={handleGoogleRegister} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="register-cellphone"
            className="ml-1 text-sm font-medium text-slate-300"
          >
            Número de celular
          </label>
          <Controller
            name="cellphone"
            control={form.control}
            render={({ field, fieldState }) => (
              <>
                <Input
                  {...field}
                  id="register-cellphone"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="(11) 99999-9999"
                  onChange={(event) => handleCellphoneChange(event.target.value)}
                  onBlur={() => void form.trigger('cellphone')}
                  aria-invalid={fieldState.invalid}
                  className={cn(
                    'h-14 rounded-2xl border border-white/10 bg-white/5 px-4 text-white placeholder:text-slate-500 focus-visible:ring-blue-500/40',
                    fieldState.invalid && 'border-red-500/50 bg-red-500/5',
                    !fieldState.invalid &&
                      isCellphoneValidated &&
                      'border-emerald-500/50 bg-emerald-500/5',
                  )}
                />
                {fieldState.error ? (
                  <p className="ml-1 text-xs font-medium text-red-400">
                    {fieldState.error.message}
                  </p>
                ) : null}
              </>
            )}
          />
          {!form.formState.errors.cellphone && isCellphoneValidated ? (
            <p className="ml-1 text-xs font-medium text-emerald-400">
              Celular validado. O cadastro com Google já está liberado.
            </p>
          ) : null}
        </div>

        <Button
          type="button"
          onClick={() => void handleCellphoneRegister()}
          className="h-auto w-full rounded-2xl bg-blue-600 py-4 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500"
        >
          Cadastrar celular
        </Button>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-950 px-2 text-slate-500">
              Plano selecionado: {plan}
            </span>
          </div>
        </div>

        <GoogleAuthButton
          disabled={!canContinueWithGoogle}
          onClick={() => void handleGoogleRegister()}
        >
          Entrar com Google
        </GoogleAuthButton>

        {!canContinueWithGoogle ? (
          <p className="text-center text-xs text-slate-500">
            Preencha um celular válido para habilitar o Google.
          </p>
        ) : null}
      </form>
    </AuthShell>
  );
}
