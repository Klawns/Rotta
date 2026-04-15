'use client';

import Link from 'next/link';
import { Lock, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isActive: boolean;
  disabled?: boolean;
  variant?: 'dock' | 'sheet';
  onNavigate?: () => void;
}

export function BottomNavItem({
  href,
  icon: Icon,
  label,
  isActive,
  disabled = false,
  variant = 'dock',
  onNavigate,
}: BottomNavItemProps) {
  const isDockVariant = variant === 'dock';
  const baseClassName = isDockVariant
    ? cn(
        'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-[1.1rem] px-1.5 py-1 text-center transition-all',
        disabled
          ? 'cursor-not-allowed opacity-55'
          : 'active:scale-[0.98] hover:bg-hover-accent/80',
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-text-secondary',
      )
    : cn(
        'flex min-h-14 w-full items-center gap-3 rounded-[1.4rem] border px-4 py-3 text-left transition-all',
        disabled
          ? 'cursor-not-allowed border-border-subtle bg-muted/30 opacity-60'
          : 'active:scale-[0.99] hover:border-border hover:bg-hover-accent',
        isActive
          ? 'border-primary/20 bg-primary/10 text-primary'
          : 'border-border-subtle bg-card-background text-text-primary',
      );
  const iconWrapperClassName = isDockVariant
    ? cn(
        'flex size-8 items-center justify-center rounded-[0.9rem] transition-colors',
        isActive ? 'bg-primary/12 text-primary' : 'bg-secondary/10 text-text-secondary',
      )
    : cn(
        'flex size-11 shrink-0 items-center justify-center rounded-2xl border transition-colors',
        isActive
          ? 'border-primary/20 bg-primary/12 text-primary'
          : 'border-border-subtle bg-secondary/10 text-text-secondary',
      );
  const labelClassName = isDockVariant
    ? cn(
        'truncate text-[9px] font-display font-bold uppercase tracking-[0.14em]',
        isActive ? 'text-primary' : 'text-text-muted',
      )
    : cn(
        'truncate text-sm font-semibold',
        isActive ? 'text-primary' : 'text-text-primary',
      );

  const content = (
    <>
      <span className={iconWrapperClassName}>
        <Icon
          size={isDockVariant ? 16 : 20}
          className={cn(
            'shrink-0 transition-transform',
            disabled ? 'opacity-70' : isActive ? 'scale-105' : '',
          )}
        />
      </span>

      <span className={cn(isDockVariant ? 'max-w-full' : 'min-w-0 flex-1')}>
        <span className={labelClassName}>{label}</span>
      </span>

      {!isDockVariant && disabled ? (
        <Lock size={14} className="shrink-0 text-text-muted" />
      ) : null}
    </>
  );

  if (disabled) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className={baseClassName}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={baseClassName}
    >
      {content}
    </Link>
  );
}
