'use client';

import {
  useClientAutocomplete,
  type ClientAutocompleteState,
} from '@/hooks/use-client-autocomplete';

export type FinanceClientAutocompleteState = ClientAutocompleteState;

export function useFinanceClientAutocomplete(): FinanceClientAutocompleteState {
  return useClientAutocomplete({
    limit: 8,
  });
}
