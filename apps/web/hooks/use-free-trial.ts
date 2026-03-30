'use client';

import { useMemo } from 'react';
import type { User } from '@/hooks/use-auth';
import {
  getFreeTrialState,
  type FreeTrialState,
} from '@/services/free-trial-service';

export function useFreeTrial(user: User | null): FreeTrialState {
  return useMemo(() => getFreeTrialState(user), [user]);
}

