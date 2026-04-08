import {
  format,
  parseISO,
  startOfMonth,
  subDays,
} from 'date-fns';
import {
  type RidePaymentFilter,
  type RidePeriodPreset,
  type RidesFilterState,
} from '@/types/rides';

interface RideFilterOption<TValue extends string> {
  label: string;
  value: TValue;
}

export interface RidesFilterChip {
  id: string;
  label: string;
}

export const RIDE_PAYMENT_FILTER_OPTIONS: readonly RideFilterOption<RidePaymentFilter>[] = [
  { value: 'all', label: 'Todas' },
  { value: 'PENDING', label: 'Com pendencia' },
  { value: 'PAID', label: 'Pagas' },
] as const;

export const RIDE_PERIOD_PRESET_OPTIONS: readonly RideFilterOption<RidePeriodPreset>[] = [
  { value: 'today', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: 'month', label: 'Mes' },
  { value: 'custom', label: 'Personalizado' },
] as const;

function toInputDate(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function formatShortInputDate(value: string) {
  if (!value) {
    return '';
  }

  return format(parseISO(value), 'dd/MM');
}

function compactFilterLabel(value: string, maxLength: number = 36) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export function getDateRangeForRidePreset(
  preset: Exclude<RidePeriodPreset, 'custom'>,
  now: Date = new Date(),
) {
  switch (preset) {
    case 'today':
      return {
        startDate: toInputDate(now),
        endDate: toInputDate(now),
      };
    case '7d':
      return {
        startDate: toInputDate(subDays(now, 6)),
        endDate: toInputDate(now),
      };
    case '30d':
      return {
        startDate: toInputDate(subDays(now, 29)),
        endDate: toInputDate(now),
      };
    case 'month':
      return {
        startDate: toInputDate(startOfMonth(now)),
        endDate: toInputDate(now),
      };
  }
}

export function normalizeRideDateRange(
  startDate: string,
  endDate: string,
  changedField: 'start' | 'end',
) {
  if (!startDate || !endDate || startDate <= endDate) {
    return {
      startDate,
      endDate,
    };
  }

  if (changedField === 'start') {
    return {
      startDate,
      endDate: startDate,
    };
  }

  return {
    startDate: endDate,
    endDate,
  };
}

function getPaymentFilterLabel(paymentFilter: RidePaymentFilter) {
  return RIDE_PAYMENT_FILTER_OPTIONS.find((option) => option.value === paymentFilter)
    ?.label;
}

function getPeriodFilterLabel(filters: RidesFilterState) {
  if (filters.periodPreset) {
    const periodOption = RIDE_PERIOD_PRESET_OPTIONS.find(
      (option) => option.value === filters.periodPreset,
    );

    if (periodOption && filters.periodPreset !== 'custom') {
      return `Periodo: ${periodOption.label}`;
    }
  }

  if (filters.startDate && filters.endDate) {
    return `Periodo: ${formatShortInputDate(filters.startDate)} - ${formatShortInputDate(filters.endDate)}`;
  }

  if (filters.startDate) {
    return `Desde ${formatShortInputDate(filters.startDate)}`;
  }

  if (filters.endDate) {
    return `Ate ${formatShortInputDate(filters.endDate)}`;
  }

  return null;
}

export function buildRidesFilterChips(filters: RidesFilterState): RidesFilterChip[] {
  const chips: RidesFilterChip[] = [];
  const trimmedSearch = filters.search.trim();

  if (trimmedSearch) {
    chips.push({
      id: 'search',
      label: `Busca: ${compactFilterLabel(trimmedSearch)}`,
    });
  }

  if (filters.paymentFilter !== 'all') {
    chips.push({
      id: 'payment',
      label: `Status: ${getPaymentFilterLabel(filters.paymentFilter)}`,
    });
  }

  if (filters.clientName) {
    chips.push({
      id: 'client',
      label: `Cliente: ${compactFilterLabel(filters.clientName)}`,
    });
  }

  const periodLabel = getPeriodFilterLabel(filters);

  if (periodLabel) {
    chips.push({
      id: 'period',
      label: periodLabel,
    });
  }

  return chips;
}
