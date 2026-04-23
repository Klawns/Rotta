import type { ReactNode } from 'react';
import { SettingsTabs } from './settings-tabs';

interface SettingsPageShellProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  showTabs?: boolean;
  headerVariant?: 'default' | 'none';
}

export function SettingsPageShell({
  title,
  description,
  icon,
  children,
  showTabs = true,
  headerVariant = 'default',
}: SettingsPageShellProps) {
  const shouldRenderHeader = headerVariant === 'default';

  return (
    <div
      className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-4 pb-32 scrollbar-hide sm:px-6"
      data-scroll-lock-root="true"
    >
      {showTabs ? (
        <div className="shrink-0 border-b border-border-subtle/80 pb-4 pt-1">
          <SettingsTabs />
        </div>
      ) : null}

      {shouldRenderHeader ? (
        <div className="shrink-0 space-y-3">
          <h2 className="flex items-center gap-3 text-3xl font-display font-black tracking-tight text-text-primary sm:text-4xl">
            {icon ? (
              <div className="rounded-2xl border border-primary/15 bg-primary p-3 text-primary-foreground shadow-sm">
                {icon}
              </div>
            ) : null}
            {title}
          </h2>

          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {children}
    </div>
  );
}
