import {
  Bike,
  LayoutDashboard,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '@/hooks/use-auth';
import { getFreeTrialState } from '@/services/free-trial-service';

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
  roles: string[];
  slot: DashboardNavSlot;
  matchStrategy: DashboardNavMatchStrategy;
  disabled?: boolean;
}

const ALL_DASHBOARD_NAV_ITEMS: ReadonlyArray<Omit<DashboardNavItem, 'disabled'>> = [
  {
    icon: LayoutDashboard,
    label: 'Visao Geral',
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
    label: 'Configuracoes',
    color: 'text-icon-brand',
    href: '/dashboard/settings',
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
    label: 'Administracao',
    color: 'text-icon-destructive',
    href: '/admin',
    roles: ['admin'],
    slot: 'secondary',
    matchStrategy: 'prefix',
  },
];

export function getDashboardNavigationItems(user: User | null): DashboardNavItem[] {
  const trial = getFreeTrialState(user);

  return ALL_DASHBOARD_NAV_ITEMS.filter((item) =>
    item.roles.includes(user?.role || 'user'),
  ).map((item) => ({
    ...item,
    disabled: Boolean(
      user?.role === 'user' &&
        trial.shouldLockFeatures &&
        item.href !== '/dashboard' &&
        item.href !== '/dashboard/settings',
    ),
  }));
}

export function isDashboardNavItemActive(
  item: Pick<DashboardNavItem, 'href' | 'matchStrategy'>,
  pathname: string,
) {
  if (item.matchStrategy === 'exact') {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
