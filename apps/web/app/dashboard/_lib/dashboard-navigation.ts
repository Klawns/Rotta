import {
  Bike,
  DatabaseBackup,
  LayoutDashboard,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '@/hooks/use-auth';
import {
  getFreeTrialState,
  isDashboardPathAllowedWhenLocked,
} from '@/services/free-trial-service';

export const DASHBOARD_MOBILE_NAV_HEIGHT = '4.5rem';
export const DASHBOARD_MOBILE_NAV_OFFSET = `calc(${DASHBOARD_MOBILE_NAV_HEIGHT} + env(safe-area-inset-bottom))`;
export const DASHBOARD_MOBILE_NAV_PADDING = `calc(${DASHBOARD_MOBILE_NAV_OFFSET} + 0.25rem)`;
export const DASHBOARD_MOBILE_SHEET_OFFSET = '0px';

export type DashboardNavSlot = 'primary' | 'secondary';
export type DashboardNavMatchStrategy = 'exact' | 'prefix';

export interface DashboardNavItem {
  icon: LucideIcon;
  label: string;
  mobileLabel?: string;
  color: string;
  href: string;
  activePrefix?: string;
  inactivePrefixes?: string[];
  roles: string[];
  slot: DashboardNavSlot;
  matchStrategy: DashboardNavMatchStrategy;
  disabled?: boolean;
}

const ALL_DASHBOARD_NAV_ITEMS: ReadonlyArray<
  Omit<DashboardNavItem, 'disabled'>
> = [
  {
    icon: LayoutDashboard,
    label: 'Visão Geral',
    mobileLabel: 'Dashboard',
    color: 'text-icon-info',
    href: '/dashboard',
    roles: ['user'],
    slot: 'primary',
    matchStrategy: 'exact',
  },
  {
    icon: Users,
    label: 'Clientes',
    color: 'text-icon-success',
    href: '/dashboard/clients',
    roles: ['user'],
    slot: 'primary',
    matchStrategy: 'prefix',
  },
  {
    icon: Bike,
    label: 'Corridas',
    color: 'text-icon-brand',
    href: '/dashboard/rides',
    roles: ['user'],
    slot: 'primary',
    matchStrategy: 'prefix',
  },
  {
    icon: Wallet,
    label: 'Financeiro',
    color: 'text-icon-warning',
    href: '/dashboard/finance',
    roles: ['user'],
    slot: 'primary',
    matchStrategy: 'prefix',
  },
  {
    icon: Settings,
    label: 'Configurações',
    color: 'text-icon-brand',
    href: '/dashboard/settings',
    activePrefix: '/dashboard/settings',
    inactivePrefixes: ['/dashboard/settings/backups'],
    roles: ['user'],
    slot: 'secondary',
    matchStrategy: 'prefix',
  },
  {
    icon: DatabaseBackup,
    label: 'Backups',
    color: 'text-icon-brand',
    href: '/dashboard/settings/backups',
    activePrefix: '/dashboard/settings/backups',
    roles: ['user'],
    slot: 'secondary',
    matchStrategy: 'prefix',
  },
  {
    icon: Sparkles,
    label: 'Tutorial',
    color: 'text-icon-brand',
    href: '/dashboard/tutorial',
    roles: ['user'],
    slot: 'secondary',
    matchStrategy: 'prefix',
  },
  {
    icon: Shield,
    label: 'Administração',
    color: 'text-icon-destructive',
    href: '/admin',
    roles: ['admin'],
    slot: 'secondary',
    matchStrategy: 'prefix',
  },
];

export function getDashboardNavigationItems(
  user: User | null,
): DashboardNavItem[] {
  const trial = getFreeTrialState(user);

  return ALL_DASHBOARD_NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role || 'user'),
  ).map((item) => ({
    ...item,
    disabled: Boolean(
      user?.role === 'user' &&
        trial.shouldLockFeatures &&
        !isDashboardPathAllowedWhenLocked(item.href),
    ),
  }));
}

export function isDashboardNavItemActive(
  item: Pick<
    DashboardNavItem,
    'href' | 'matchStrategy' | 'activePrefix' | 'inactivePrefixes'
  >,
  pathname: string,
) {
  const normalizedPathname = normalizeDashboardPath(pathname);
  const normalizedHref = normalizeDashboardPath(item.href);
  const inactivePrefixes = (item.inactivePrefixes ?? []).map(
    normalizeDashboardPath,
  );

  if (
    inactivePrefixes.some(
      (inactivePrefix) =>
        normalizedPathname === inactivePrefix ||
        normalizedPathname.startsWith(`${inactivePrefix}/`),
    )
  ) {
    return false;
  }

  if (item.matchStrategy === 'exact') {
    return normalizedPathname === normalizedHref;
  }

  const activePrefix = normalizeDashboardPath(item.activePrefix ?? item.href);

  return (
    normalizedPathname === normalizedHref ||
    normalizedPathname.startsWith(`${activePrefix}/`)
  );
}

function normalizeDashboardPath(pathname: string | null | undefined) {
  if (!pathname) {
    return '/dashboard';
  }

  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }

  return pathname;
}
