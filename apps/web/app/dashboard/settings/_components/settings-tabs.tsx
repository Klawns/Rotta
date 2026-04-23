'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { getSettingsTabItems } from './settings-tabs.config';

export function SettingsTabs() {
  const pathname = usePathname();
  const tabs = getSettingsTabItems(pathname);

  return (
    <nav
      aria-label="Secoes de configuracoes"
      className="flex w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border-subtle bg-background/80 p-1 shadow-sm scrollbar-hide md:w-fit"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isDanger = tab.variant === 'danger';

        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={tab.isActive ? 'page' : undefined}
            className={cn(
              'flex min-w-fit flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:px-4 md:flex-initial',
              tab.isActive
                ? isDanger
                  ? 'border border-destructive/20 bg-destructive/10 text-destructive'
                  : 'bg-card text-text-primary'
                : 'text-text-secondary hover:bg-hover-accent/70 hover:text-text-primary',
            )}
          >
            <Icon
              size={14}
              strokeWidth={tab.isActive ? 2.6 : 2.2}
              className={cn(
                'h-4 w-4 shrink-0',
                !tab.isActive && (isDanger ? 'text-destructive' : 'text-primary'),
              )}
            />

            <span className="truncate">{tab.mobileLabel}</span>
          </Link>
        );
      })}
    </nav>
  );
}
