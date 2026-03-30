'use client';

import { useCallback, useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { clientKeys, rideKeys } from '@/lib/query-keys';
import { clientsService } from '@/services/clients-service';
import { type ClientPayment } from '@/types/client-payments';
import { Client } from '@/types/rides';
import { ridesService } from '@/services/rides-service';
import { useClientDetailsExport } from './use-client-details-export';

function getEmptyClientKey(suffix: string) {
  return ['clients', 'detail', 'null', suffix];
}

export function useClientDetailsData(client: Client | null) {
  const rideLimit = 10;

  const {
    data: ridesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isRidesLoading,
    refetch: refetchRides,
  } = useInfiniteQuery({
    queryKey: client
      ? rideKeys.byClient(client.id, { limit: rideLimit })
      : getEmptyClientKey('rides'),
    queryFn: ({ pageParam, signal }) =>
      ridesService.getRidesByClient(
        client!.id,
        {
          limit: rideLimit,
          cursor: pageParam as string | undefined,
        },
        signal,
      ),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta?.hasNextPage ? lastPage.meta.nextCursor : undefined,
    enabled: !!client,
    staleTime: 60000,
  });

  const {
    data: balance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: client ? clientKeys.balance(client.id) : getEmptyClientKey('balance'),
    queryFn: () => clientsService.getClientBalance(client!.id),
    enabled: !!client,
    staleTime: 60000,
  });

  const {
    data: payments = [] as ClientPayment[],
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useQuery({
    queryKey: client ? clientKeys.payments(client.id) : getEmptyClientKey('payments'),
    queryFn: () => clientsService.getClientPayments(client!.id),
    enabled: !!client,
    staleTime: 60000,
  });

  const rides = useMemo(() => {
    const allRides = ridesData?.pages.flatMap((page) => page.data) || [];
    return Array.from(new Map(allRides.map((ride) => [ride.id, ride])).values());
  }, [ridesData]);

  const refreshDetails = useCallback(() => {
    refetchRides();
    refetchBalance();
    refetchPayments();
  }, [refetchRides, refetchBalance, refetchPayments]);
  const { generatePDF, generateExcel } = useClientDetailsExport({
    client,
    balance: balance || null,
    payments,
  });

  return {
    rides,
    balance: balance || null,
    payments,
    rideTotal: rides.length,
    rideLimit,
    isLoading: isRidesLoading || isBalanceLoading || isPaymentsLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refreshDetails,
    generatePDF,
    generateExcel,
  };
}
