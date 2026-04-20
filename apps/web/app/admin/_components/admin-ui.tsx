import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface AdminPageProps {
  children: ReactNode;
  className?: string;
}

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
  className?: string;
}

interface AdminCardProps {
  children?: ReactNode;
  className?: string;
}

interface AdminStateBlockProps {
  title: string;
  description?: string;
  className?: string;
}

export function AdminPage({ children, className }: AdminPageProps) {
  return <div className={cn('admin-page', className)}>{children}</div>;
}

export function AdminPageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: AdminPageHeaderProps) {
  return (
    <section className={cn('admin-page-header', className)}>
      <div className="space-y-3">
        {badge ? <span className="admin-page-badge">{badge}</span> : null}
        <div className="space-y-2">
          <h1 className="admin-page-title">{title}</h1>
          {description ? <p className="admin-page-description">{description}</p> : null}
        </div>
      </div>

      {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
    </section>
  );
}

export function AdminCard({ children, className }: AdminCardProps) {
  return <div className={cn('admin-card', className)}>{children}</div>;
}

export function AdminLoadingState({
  title,
  description,
  className,
}: AdminStateBlockProps) {
  return (
    <div className={cn('admin-state-block', className)}>
      <div className="admin-state-spinner" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function AdminEmptyState({
  title,
  description,
  className,
}: AdminStateBlockProps) {
  return (
    <div className={cn('admin-state-block', className)}>
      <div className="space-y-1 text-center">
        <p className="font-semibold text-foreground">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
