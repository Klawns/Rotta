'use client';

import { type User } from '@/hooks/use-auth';
import {
  DASHBOARD_HOME_PATH,
  isDashboardPathAllowedWhenLocked,
  isStarterSubscriptionActive,
  getFreeTrialState,
} from '@/services/free-trial-service';

const DASHBOARD_PAYMENT_SUCCESS_PATH = '/dashboard/payment-success';

interface ResolveDashboardRedirectParams {
  pathname: string;
  isAuthenticated: boolean;
  user: User | null;
}

export { isStarterSubscriptionActive };

export function shouldBlockDashboardAccess(user: User | null) {
  if (user?.role !== 'user') {
    return false;
  }

  const subscription = user.subscription;

  if (!subscription) {
    return true;
  }

  return getFreeTrialState(user).shouldLockFeatures;
}

export function resolveDashboardRedirect({
  pathname,
  isAuthenticated,
  user,
}: ResolveDashboardRedirectParams) {
  if (!isAuthenticated) {
    return '/login';
  }

  if (user?.role === 'admin') {
    return '/admin';
  }

  if (
    pathname.startsWith('/dashboard') &&
    pathname !== DASHBOARD_PAYMENT_SUCCESS_PATH &&
    shouldBlockDashboardAccess(user) &&
    !isDashboardPathAllowedWhenLocked(pathname)
  ) {
    return DASHBOARD_HOME_PATH;
  }

  return null;
}

