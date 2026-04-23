'use client';

import { useSyncExternalStore } from 'react';
import {
  getAdminReauthSessionSnapshot,
  subscribeToAdminReauthSession,
} from '../_lib/admin-reauth-storage';

export function useAdminReauthSession() {
  return useSyncExternalStore(
    subscribeToAdminReauthSession,
    getAdminReauthSessionSnapshot,
    () => null,
  );
}
