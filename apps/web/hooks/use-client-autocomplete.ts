'use client';

import { useMemo, useState } from 'react';
import { useClientDirectoryQuery } from '@/hooks/use-client-directory-query';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import {
  CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH,
  getAppliedClientAfterInputChange,
  shouldSearchClients,
  type AppliedClientAutocomplete,
  isAppliedClientSynced,
} from '@/lib/client-autocomplete';
import { type ClientDirectoryMeta } from '@/services/clients-service';
import { type ClientDirectoryEntry } from '@/types/rides';

const DEFAULT_DEBOUNCE_MS = 300;
const DEFAULT_LIMIT = 8;

interface UseClientAutocompleteOptions {
  debounceMs?: number;
  initialClient?: AppliedClientAutocomplete | null;
  limit?: number;
  minimumLength?: number;
}

export interface ClientAutocompleteState {
  searchText: string;
  appliedClientId?: string;
  appliedClientName: string | null;
  suggestions: ClientDirectoryEntry[];
  isOpen: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: unknown;
  isReady: boolean;
  meta: ClientDirectoryMeta | null;
  hasSearchValue: boolean;
  hasMinimumSearchLength: boolean;
  hasAppliedClient: boolean;
  hasEmptyResults: boolean;
  minimumSearchLength: number;
  setSearchText: (value: string) => void;
  onFocus: () => void;
  onOpenChange: (open: boolean) => void;
  onSelect: (client: ClientDirectoryEntry) => void;
  onClear: () => void;
  refetch: () => Promise<unknown>;
}

export function useClientAutocomplete(
  options?: UseClientAutocompleteOptions,
): ClientAutocompleteState {
  const minimumSearchLength =
    options?.minimumLength ?? CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH;
  const [searchText, setSearchTextState] = useState(options?.initialClient?.name ?? '');
  const [appliedClient, setAppliedClient] = useState<AppliedClientAutocomplete | null>(
    options?.initialClient ?? null,
  );
  const [isOpen, setIsOpen] = useState(false);

  const normalizedSearchText = searchText.trim();
  const debouncedSearch = useDebouncedValue(
    normalizedSearchText,
    options?.debounceMs ?? DEFAULT_DEBOUNCE_MS,
  );
  const hasSearchValue = normalizedSearchText.length > 0;
  const hasMinimumSearchLength =
    normalizedSearchText.length >= minimumSearchLength;
  const isDebouncing = normalizedSearchText !== debouncedSearch;
  const shouldSearch = shouldSearchClients(
    debouncedSearch,
    appliedClient,
    minimumSearchLength,
  );

  const clientDirectory = useClientDirectoryQuery({
    enabled: shouldSearch,
    search: shouldSearch ? debouncedSearch : undefined,
    limit: options?.limit ?? DEFAULT_LIMIT,
  });

  const suggestions = useMemo(() => {
    if (!shouldSearch || isDebouncing) {
      return [];
    }

    return clientDirectory.clients;
  }, [clientDirectory.clients, isDebouncing, shouldSearch]);

  const isLoading = hasMinimumSearchLength
    ? isDebouncing || (shouldSearch && clientDirectory.isLoading)
    : false;
  const isFetching = shouldSearch && clientDirectory.isFetching;
  const isError = shouldSearch && clientDirectory.isError;
  const hasEmptyResults =
    shouldSearch &&
    !isDebouncing &&
    clientDirectory.isReady &&
    !clientDirectory.isError &&
    suggestions.length === 0;
  const isReady =
    !hasSearchValue || (!isDebouncing && (!shouldSearch || clientDirectory.isReady));
  const hasPanelContent =
    hasMinimumSearchLength &&
    (isLoading || isError || hasEmptyResults || suggestions.length > 0);

  const setSearchText = (value: string) => {
    setSearchTextState(value);
    setAppliedClient((currentClient) =>
      getAppliedClientAfterInputChange(value, currentClient),
    );

    if (!value.trim()) {
      setIsOpen(false);
      return;
    }

    setIsOpen(value.trim().length >= minimumSearchLength);
  };

  const handleSelect = (client: ClientDirectoryEntry) => {
    setAppliedClient({ id: client.id, name: client.name });
    setSearchTextState(client.name);
    setIsOpen(false);
  };

  const handleClear = () => {
    setAppliedClient(null);
    setSearchTextState('');
    setIsOpen(false);
  };

  return {
    searchText,
    appliedClientId: appliedClient?.id,
    appliedClientName: appliedClient?.name ?? null,
    suggestions,
    isOpen: isOpen && hasSearchValue && hasPanelContent,
    isLoading,
    isFetching,
    isError,
    error: isError ? clientDirectory.error : null,
    isReady,
    meta: shouldSearch && !isDebouncing ? clientDirectory.meta : null,
    hasSearchValue,
    hasMinimumSearchLength,
    hasAppliedClient: Boolean(appliedClient),
    hasEmptyResults,
    minimumSearchLength,
    setSearchText,
    onFocus: () => {
      if (
        hasSearchValue &&
        hasMinimumSearchLength &&
        !isAppliedClientSynced(normalizedSearchText, appliedClient)
      ) {
        setIsOpen(true);
      }
    },
    onOpenChange: setIsOpen,
    onSelect: handleSelect,
    onClear: handleClear,
    refetch: clientDirectory.refetch,
  };
}
