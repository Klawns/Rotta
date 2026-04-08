'use client';

import { useCallback, useMemo, useState } from 'react';
import { useClientAutocomplete } from '@/hooks/use-client-autocomplete';
import {
  buildRidesFilterChips,
  getDateRangeForRidePreset,
  normalizeRideDateRange,
} from '../_lib/rides-filters';
import {
  type RidePaymentFilter,
  type RidePeriodPreset,
  type RidesFilterState,
} from '@/types/rides';

export function useRidesFilters() {
  const [search, setSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState<RidePaymentFilter>('all');
  const [periodPreset, setPeriodPresetState] = useState<RidePeriodPreset | null>(null);
  const [startDate, setStartDateState] = useState('');
  const [endDate, setEndDateState] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const clientAutocomplete = useClientAutocomplete({
    limit: 8,
  });

  const handleSetPeriodPreset = useCallback(
    (nextPreset: RidePeriodPreset) => {
      if (nextPreset === 'custom') {
        setPeriodPresetState('custom');
        return;
      }

      if (periodPreset === nextPreset) {
        setPeriodPresetState(null);
        setStartDateState('');
        setEndDateState('');
        return;
      }

      const nextDateRange = getDateRangeForRidePreset(nextPreset);
      setPeriodPresetState(nextPreset);
      setStartDateState(nextDateRange.startDate);
      setEndDateState(nextDateRange.endDate);
    },
    [periodPreset],
  );

  const handleSetStartDate = useCallback(
    (value: string) => {
      const nextRange = normalizeRideDateRange(value, endDate, 'start');
      setPeriodPresetState('custom');
      setStartDateState(nextRange.startDate);
      setEndDateState(nextRange.endDate);
    },
    [endDate],
  );

  const handleSetEndDate = useCallback(
    (value: string) => {
      const nextRange = normalizeRideDateRange(startDate, value, 'end');
      setPeriodPresetState('custom');
      setStartDateState(nextRange.startDate);
      setEndDateState(nextRange.endDate);
    },
    [startDate],
  );

  const clearFilters = useCallback(() => {
    setSearch('');
    setPaymentFilter('all');
    setPeriodPresetState(null);
    setStartDateState('');
    setEndDateState('');
    clientAutocomplete.onClear();
  }, [clientAutocomplete]);

  const filterState = useMemo(
    (): RidesFilterState => ({
      search,
      paymentFilter,
      clientId: clientAutocomplete.appliedClientId ?? null,
      clientName: clientAutocomplete.appliedClientName,
      periodPreset,
      startDate,
      endDate,
    }),
    [
      clientAutocomplete.appliedClientId,
      clientAutocomplete.appliedClientName,
      endDate,
      paymentFilter,
      periodPreset,
      search,
      startDate,
    ],
  );

  const activeFilterChips = useMemo(
    () => buildRidesFilterChips(filterState),
    [filterState],
  );

  return {
    filterState,
    clientAutocomplete,
    activeFilterChips,
    activeFilterCount: activeFilterChips.length,
    setSearch,
    setPaymentFilter,
    setStartDate: handleSetStartDate,
    setEndDate: handleSetEndDate,
    setPeriodPreset: handleSetPeriodPreset,
    isFiltersOpen,
    setIsFiltersOpen,
    hasActiveFilters: activeFilterChips.length > 0,
    clearFilters,
  };
}
