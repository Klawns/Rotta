'use client';

import { useDeferredValue } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useClientDirectory } from '@/hooks/use-client-directory';
import { clientKeys, settingsKeys } from '@/lib/query-keys';
import { rideModalService } from '../services/ride-modal-service';

interface UseRideFormDataProps {
  isOpen?: boolean;
  userId?: string;
  clientId?: string;
  clientSearch: string;
  selectedClientId: string;
}

export function useRideFormData({
  isOpen,
  userId,
  clientId,
  clientSearch,
  selectedClientId,
}: UseRideFormDataProps) {
  const isEnabled = Boolean(isOpen && userId);
  const shouldLoadDirectory = isEnabled && !clientId;
  const deferredClientSearch = useDeferredValue(clientSearch.trim());

  const clientDirectory = useClientDirectory({
    enabled: shouldLoadDirectory,
    search: deferredClientSearch,
    limit: 24,
    selectedClientId,
  });

  const { data: presets = [], isLoading: isLoadingPresets } = useQuery({
    queryKey: settingsKeys.presets(),
    queryFn: () => rideModalService.getRidePresets(),
    enabled: isEnabled,
  });

  const { data: clientBalanceData } = useQuery({
    queryKey: selectedClientId
      ? clientKeys.balance(selectedClientId)
      : [...clientKeys.all, 'balance', 'empty'],
    queryFn: () => rideModalService.getClientBalance(selectedClientId),
    enabled: isEnabled && !!selectedClientId,
    staleTime: 30000,
  });

  return {
    clients: shouldLoadDirectory ? clientDirectory.clients : [],
    presets,
    clientBalance: clientBalanceData?.clientBalance || 0,
    isLoadingData: (shouldLoadDirectory && clientDirectory.isLoading) || isLoadingPresets,
    isFetchingClients: shouldLoadDirectory ? clientDirectory.isFetching : false,
    isClientDirectoryError: shouldLoadDirectory ? clientDirectory.isError : false,
    clientDirectoryError: shouldLoadDirectory ? clientDirectory.error : null,
    retryClientDirectory: clientDirectory.refetch,
    isClientDirectoryReady: shouldLoadDirectory ? clientDirectory.isReady : true,
    clientDirectoryMeta: shouldLoadDirectory ? clientDirectory.meta : null,
  };
}
