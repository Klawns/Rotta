import { Settings2, ShieldAlert, type LucideIcon } from 'lucide-react';

export interface SettingsTabItem {
  id: 'general' | 'danger';
  href: '/dashboard/settings' | '/dashboard/settings/danger';
  label: string;
  mobileLabel: string;
  icon: LucideIcon;
  variant?: 'danger';
}

export interface SettingsTabViewModel extends SettingsTabItem {
  isActive: boolean;
}

const SETTINGS_TAB_ITEMS: ReadonlyArray<SettingsTabItem> = [
  {
    id: 'general',
    href: '/dashboard/settings',
    label: 'Atalhos',
    mobileLabel: 'Atalhos',
    icon: Settings2,
  },
  {
    id: 'danger',
    href: '/dashboard/settings/danger',
    label: 'Limpeza',
    mobileLabel: 'Limpeza',
    icon: ShieldAlert,
    variant: 'danger',
  },
];

export function getSettingsTabItems(pathname: string): SettingsTabViewModel[] {
  const normalizedPathname = normalizeSettingsPath(pathname);

  return SETTINGS_TAB_ITEMS.map((item) => ({
    ...item,
    isActive: normalizedPathname === item.href,
  }));
}

function normalizeSettingsPath(pathname: string | null | undefined) {
  if (!pathname) {
    return '/dashboard/settings';
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}
