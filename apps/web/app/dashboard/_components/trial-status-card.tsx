'use client';

import Link from 'next/link';
import { CalendarClock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FreeTrialState } from '@/services/free-trial-service';

interface TrialStatusCardProps {
  trial: FreeTrialState;
  className?: string;
}

export function TrialStatusCard({
  trial,
  className,
}: TrialStatusCardProps) {
  if (!trial.shouldShowTrialStatus) {
    return null;
  }

  const toneClass = trial.isStarterExpired
    ? 'border-trial-expired/30 bg-trial-expired/10'
    : trial.isExpiringSoon
      ? 'border-trial-warning/30 bg-trial-warning/10'
      : 'border-trial-active/30 bg-trial-active/10';

  const iconToneClass = trial.isStarterExpired
    ? 'bg-trial-expired/15 text-trial-expired'
    : trial.isExpiringSoon
      ? 'bg-trial-warning/15 text-trial-warning'
      : 'bg-trial-active/15 text-trial-active';

  const title = trial.isStarterExpired
    ? 'Seu trial expirou'
    : `Voce tem ${trial.daysRemaining} ${trial.daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`;

  const description = trial.isStarterExpired
    ? 'As funcionalidades principais permanecem visiveis, mas estao bloqueadas ate a ativacao de um plano pago.'
    : trial.isExpiringSoon
      ? 'Seu periodo gratuito esta perto do fim. Garanta a continuidade antes do bloqueio.'
      : 'Seu acesso gratuito esta ativo. Aproveite este periodo para configurar sua operacao.';

  return (
    <section
      className={cn(
        'rounded-[2rem] border px-5 py-5 shadow-sm backdrop-blur-sm md:px-6',
        toneClass,
        className,
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl',
              iconToneClass,
            )}
          >
            {trial.isStarterExpired ? (
              <Sparkles size={20} />
            ) : (
              <CalendarClock size={20} />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-black uppercase tracking-[0.24em] text-text-secondary">
              Trial Gratuito
            </p>
            <h2 className="text-xl font-display font-extrabold tracking-tight text-text-primary">
              {title}
            </h2>
            <p className="max-w-2xl text-sm text-text-secondary">
              {description}
            </p>
          </div>
        </div>

        <Link
          href={trial.ctaHref}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-trial-cta px-5 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-button-shadow transition-all hover:bg-button-primary-hover"
        >
          {trial.ctaLabel}
        </Link>
      </div>
    </section>
  );
}

