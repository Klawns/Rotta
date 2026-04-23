import type { User } from '@/hooks/use-auth';

export const CHECKOUT_CTA_HREF = '/contato';
export const DASHBOARD_HOME_PATH = '/dashboard';
export const DASHBOARD_SETTINGS_PATH = '/dashboard/settings';
export const DASHBOARD_SETTINGS_DANGER_PATH = '/dashboard/settings/danger';
export const DASHBOARD_SETTINGS_BACKUPS_PATH =
  '/dashboard/settings/backups';

const DASHBOARD_ALLOWED_WHEN_LOCKED = new Set([
  DASHBOARD_HOME_PATH,
  DASHBOARD_SETTINGS_PATH,
  DASHBOARD_SETTINGS_DANGER_PATH,
  DASHBOARD_SETTINGS_BACKUPS_PATH,
]);

export interface FreeTrialState {
  isStarter: boolean;
  isStarterActive: boolean;
  isStarterExpired: boolean;
  isExpired: boolean;
  daysRemaining: number;
  trialEndsAt: string | null;
  isExpiringSoon: boolean;
  shouldShowTrialStatus: boolean;
  shouldLockFeatures: boolean;
  ctaHref: string;
  ctaLabel: string;
}

function toPositiveInteger(value: number | undefined) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.ceil(value ?? 0));
}

export function getFreeTrialState(user: User | null): FreeTrialState {
  const subscription = user?.subscription;
  const isStarter = subscription?.plan === 'starter';
  const isExpired = subscription?.status === 'expired';
  const daysRemaining = toPositiveInteger(subscription?.trialDaysRemaining);

  return {
    isStarter,
    isStarterActive: isStarter && subscription?.status === 'active',
    isStarterExpired: isStarter && isExpired,
    isExpired,
    daysRemaining,
    trialEndsAt: subscription?.trialEndsAt ?? null,
    isExpiringSoon: Boolean(subscription?.isTrialExpiringSoon),
    shouldShowTrialStatus: isStarter,
    shouldLockFeatures: !subscription || isExpired,
    ctaHref: CHECKOUT_CTA_HREF,
    ctaLabel: isStarter && isExpired ? 'Desbloquear acesso' : 'Assinar agora',
  };
}

export function isStarterSubscriptionActive(user: User | null) {
  return getFreeTrialState(user).isStarterActive;
}

export function isDashboardPathAllowedWhenLocked(pathname: string) {
  return DASHBOARD_ALLOWED_WHEN_LOCKED.has(pathname);
}
