'use client';

import { useMemo } from 'react';

import { getAdminBillingSummaryPresentation } from '../_presenters/admin-billing.presenter';
import { useAdminBillingSummaryQuery } from './use-admin-billing-summary-query';

export function useAdminBillingSummary() {
  const summaryQuery = useAdminBillingSummaryQuery();

  const presentation = useMemo(() => {
    if (!summaryQuery.data) {
      return null;
    }

    return getAdminBillingSummaryPresentation(summaryQuery.data);
  }, [summaryQuery.data]);

  return {
    summary: summaryQuery.data ?? null,
    presentation,
    isLoading: summaryQuery.isLoading,
    isFetching: summaryQuery.isFetching,
    error: summaryQuery.error,
    refetch: summaryQuery.refetch,
  };
}
