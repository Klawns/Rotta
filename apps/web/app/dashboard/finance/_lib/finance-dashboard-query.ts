import {
  type FinanceDashboardParams,
  type FinanceDashboardQueryKey,
} from '@/services/finance-service';
import { type PeriodId } from '../_types';

export interface FinanceFiltersState {
  period: PeriodId;
  startDate?: string;
  endDate?: string;
}

export function buildFinanceDashboardParams(
  filters: FinanceFiltersState,
  clientId?: string,
): FinanceDashboardParams | null {
  if (filters.period === 'custom') {
    if (!filters.startDate || !filters.endDate) {
      return null;
    }

    return {
      period: 'custom',
      clientId,
      start: filters.startDate,
      end: filters.endDate,
    };
  }

  return {
    period: filters.period,
    clientId,
  };
}

export function buildFinanceDashboardQueryKey(
  filters: FinanceFiltersState,
  clientId?: string,
): FinanceDashboardQueryKey {
  return {
    period: filters.period,
    clientId,
    start: filters.period === 'custom' ? filters.startDate : undefined,
    end: filters.period === 'custom' ? filters.endDate : undefined,
  };
}
