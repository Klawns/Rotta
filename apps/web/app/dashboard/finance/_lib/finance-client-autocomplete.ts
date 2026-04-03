import { type ClientDirectoryEntry } from '@/types/rides';

export const FINANCE_CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH = 2;

export type AppliedFinanceClient = Pick<ClientDirectoryEntry, 'id' | 'name'>;

export function isAppliedClientSynced(
  searchText: string,
  appliedClient: AppliedFinanceClient | null,
) {
  if (!appliedClient) {
    return false;
  }

  return (
    searchText.trim().localeCompare(appliedClient.name.trim(), 'pt-BR', {
      sensitivity: 'base',
    }) === 0
  );
}

export function getAppliedClientAfterInputChange(
  nextSearchText: string,
  appliedClient: AppliedFinanceClient | null,
) {
  const normalizedSearchText = nextSearchText.trim();

  if (!normalizedSearchText) {
    return null;
  }

  return isAppliedClientSynced(normalizedSearchText, appliedClient)
    ? appliedClient
    : null;
}

export function shouldSearchFinanceClients(
  searchText: string,
  appliedClient: AppliedFinanceClient | null,
  minimumLength: number = FINANCE_CLIENT_AUTOCOMPLETE_MIN_SEARCH_LENGTH,
) {
  const normalizedSearchText = searchText.trim();

  return (
    normalizedSearchText.length >= minimumLength &&
    !isAppliedClientSynced(normalizedSearchText, appliedClient)
  );
}
