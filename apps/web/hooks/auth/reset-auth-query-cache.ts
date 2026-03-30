'use client';

import { type QueryClient } from '@tanstack/react-query';
import {
  adminKeys,
  authKeys,
  clientKeys,
  financeKeys,
  paymentKeys,
  rideKeys,
  settingsKeys,
} from '@/lib/query-keys';

export function resetAuthQueryCache(queryClient: QueryClient) {
  void queryClient.cancelQueries();

  queryClient.setQueryData(authKeys.user(), null);
  queryClient.removeQueries({ queryKey: rideKeys.all });
  queryClient.removeQueries({ queryKey: clientKeys.all });
  queryClient.removeQueries({ queryKey: financeKeys.all });
  queryClient.removeQueries({ queryKey: settingsKeys.all });
  queryClient.removeQueries({ queryKey: paymentKeys.all });
  queryClient.removeQueries({ queryKey: adminKeys.all });
}
