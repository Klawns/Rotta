'use client';

import type { BackupHeaderViewModel } from '../_types/admin-backups.types';

interface BackupPageHeaderProps {
  header: BackupHeaderViewModel;
}

export function BackupPageHeader({ header }: BackupPageHeaderProps) {
  return (
    <section className="space-y-2">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Admin area
        </p>
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {header.title}
          </h1>
          <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
            {header.description}
          </p>
        </div>
      </div>
    </section>
  );
}
