'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureLockShellProps {
  isLocked: boolean;
  title: string;
  description: string;
  ctaHref: string;
  ctaLabel: string;
  children: ReactNode;
  className?: string;
}

export function FeatureLockShell({
  isLocked,
  title,
  description,
  ctaHref,
  ctaLabel,
  children,
  className,
}: FeatureLockShellProps) {
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          isLocked &&
            'pointer-events-none select-none opacity-45 grayscale-[0.4] saturate-50',
        )}
      >
        {children}
      </div>

      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[2rem] border border-blocked-border bg-blocked-surface px-5 py-6 text-center shadow-xl backdrop-blur-sm">
          <div className="max-w-sm space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-trial-expired/15 text-trial-expired">
              <Lock size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-display font-extrabold text-blocked-foreground">
                {title}
              </h3>
              <p className="text-sm text-blocked-foreground/80">{description}</p>
            </div>
            <Link
              href={ctaHref}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-trial-cta px-5 py-3 text-sm font-black text-primary-foreground shadow-lg shadow-button-shadow transition-all hover:bg-button-primary-hover"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

