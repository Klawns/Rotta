import { type InfiniteData, type QueryClient } from '@tanstack/react-query';
import { clientKeys } from '@/lib/query-keys';
import { type ApiEnvelope } from '@/services/api';
import { type ClientPayment } from '@/types/client-payments';
import { type Client, type CursorMeta } from '@/types/rides';

type ClientListEnvelope = ApiEnvelope<Client[], CursorMeta>;
type ClientInfiniteData = InfiniteData<ClientListEnvelope, string | undefined>;
const EMPTY_CLIENT_META = {
  hasNextPage: false,
  nextCursor: undefined,
  total: 0,
} satisfies CursorMeta & { total: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isClientListEnvelope(value: unknown): value is ClientListEnvelope {
  return (
    isRecord(value) &&
    Array.isArray(value.data) &&
    isRecord(value.meta)
  );
}

function isClientInfiniteData(value: unknown): value is ClientInfiniteData {
  return (
    isRecord(value) &&
    Array.isArray(value.pages) &&
    Array.isArray(value.pageParams)
  );
}

function compareClients(left: Client, right: Client) {
  if (!!left.isPinned !== !!right.isPinned) {
    return left.isPinned ? -1 : 1;
  }

  const nameComparison = (left.name || '').localeCompare(right.name || '', 'pt-BR', {
    sensitivity: 'base',
  });

  if (nameComparison !== 0) {
    return nameComparison;
  }

  return left.id.localeCompare(right.id);
}

function upsertSortedClients(clients: Client[], client: Client) {
  return Array.from(
    new Map([...clients, client].map((item) => [item.id, item])).values(),
  ).sort(compareClients);
}

function removeClient(clients: Client[], clientId: string) {
  return clients.filter((client) => client.id !== clientId);
}

function matchesSearch(client: Client, search?: string) {
  if (!search?.trim()) {
    return true;
  }

  return client.name.toLowerCase().includes(search.trim().toLowerCase());
}

function getSearchFromQueryKey(queryKey: readonly unknown[]) {
  const filtersEntry = queryKey.find(
    (entry) => isRecord(entry) && isRecord(entry.filters),
  ) as { filters?: { search?: unknown } } | undefined;

  return typeof filtersEntry?.filters?.search === 'string'
    ? filtersEntry.filters.search
    : undefined;
}

function updateEnvelope(
  envelope: ClientListEnvelope,
  client: Client,
  search?: string,
) {
  const nextData = matchesSearch(client, search)
    ? upsertSortedClients(envelope.data, client)
    : removeClient(envelope.data, client.id);

  return {
    ...envelope,
    data: nextData,
  };
}

function isInfiniteClientQuery(queryKey: readonly unknown[]) {
  return queryKey[0] === clientKeys.all[0] && queryKey.at(-1) === 'infinite';
}

function isClientListQuery(queryKey: readonly unknown[]) {
  return queryKey.length === 2 && queryKey[0] === clientKeys.all[0] && queryKey[1] === 'list';
}

function isClientPaymentsQuery(queryKey: readonly unknown[], clientId: string) {
  return (
    queryKey[0] === clientKeys.all[0] &&
    queryKey[1] === 'detail' &&
    queryKey[2] === clientId &&
    queryKey[3] === 'payments'
  );
}

function getStatusFromPaymentsQueryKey(queryKey: readonly unknown[]) {
  const filtersEntry = queryKey.find(
    (entry) => isRecord(entry) && isRecord(entry.filters),
  ) as { filters?: { status?: unknown } } | undefined;

  return typeof filtersEntry?.filters?.status === 'string'
    ? filtersEntry.filters.status
    : undefined;
}

function upsertSortedPayments(payments: ClientPayment[], payment: ClientPayment) {
  return Array.from(
    new Map([payment, ...payments].map((item) => [item.id, item])).values(),
  ).sort((left, right) => (right.paymentDate || '').localeCompare(left.paymentDate || ''));
}

export function upsertClientCaches(queryClient: QueryClient, client: Client) {
  queryClient.setQueryData(clientKeys.detail(client.id), client);

  const clientQueries = queryClient.getQueryCache().findAll({
    queryKey: clientKeys.all,
  });

  for (const query of clientQueries) {
    if (isInfiniteClientQuery(query.queryKey)) {
      queryClient.setQueryData(query.queryKey, (current: unknown) => {
        if (!isClientInfiniteData(current)) {
          return current;
        }

        const search = getSearchFromQueryKey(query.queryKey);
        const [firstPage, ...remainingPages] = current.pages;

        if (!firstPage) {
          return current;
        }

        return {
          ...current,
          pages: [
            updateEnvelope(firstPage, client, search),
            ...remainingPages,
          ],
        };
      });

      continue;
    }

    if (isClientListQuery(query.queryKey)) {
      queryClient.setQueryData(query.queryKey, (current: unknown) => {
        if (!isClientListEnvelope(current)) {
          return current;
        }

        return updateEnvelope(current, client);
      });
    }
  }
}

export function removeClientCaches(queryClient: QueryClient, clientId: string) {
  queryClient.removeQueries({
    queryKey: clientKeys.detail(clientId),
    exact: true,
  });

  const clientQueries = queryClient.getQueryCache().findAll({
    queryKey: clientKeys.all,
  });

  for (const query of clientQueries) {
    if (isInfiniteClientQuery(query.queryKey)) {
      queryClient.setQueryData(query.queryKey, (current: unknown) => {
        if (!isClientInfiniteData(current)) {
          return current;
        }

        return {
          ...current,
          pages: current.pages.map((page) => ({
            ...page,
            data: removeClient(page.data, clientId),
          })),
        };
      });

      continue;
    }

    if (isClientListQuery(query.queryKey)) {
      queryClient.setQueryData(query.queryKey, (current: unknown) => {
        if (!isClientListEnvelope(current)) {
          return current;
        }

        return {
          ...current,
          data: removeClient(current.data, clientId),
        };
      });
    }
  }
}

export function upsertClientPaymentCaches(
  queryClient: QueryClient,
  payment: ClientPayment,
) {
  const paymentQueries = queryClient.getQueryCache().findAll({
    queryKey: clientKeys.detail(payment.clientId),
  });

  for (const query of paymentQueries) {
    if (!isClientPaymentsQuery(query.queryKey, payment.clientId)) {
      continue;
    }

    queryClient.setQueryData(query.queryKey, (current: unknown) => {
      if (!Array.isArray(current)) {
        return current;
      }

      const status = getStatusFromPaymentsQueryKey(query.queryKey);

      if (status && status !== payment.status) {
        return current;
      }

      return upsertSortedPayments(current as ClientPayment[], payment);
    });
  }
}

export function clearClientCaches(queryClient: QueryClient) {
  queryClient.removeQueries({
    predicate: (query) =>
      query.queryKey[0] === clientKeys.all[0] && query.queryKey[1] === 'detail',
  });

  const clientQueries = queryClient.getQueryCache().findAll({
    queryKey: clientKeys.all,
  });

  for (const query of clientQueries) {
    if (isInfiniteClientQuery(query.queryKey)) {
      queryClient.setQueryData(query.queryKey, () => ({
        pages: [],
        pageParams: [],
      }));
      continue;
    }

    if (isClientListQuery(query.queryKey)) {
      queryClient.setQueryData(query.queryKey, (current: unknown) => {
        if (!isClientListEnvelope(current)) {
          return {
            data: [],
            meta: EMPTY_CLIENT_META,
          };
        }

        return {
          ...current,
          data: [],
          meta: {
            ...current.meta,
            ...EMPTY_CLIENT_META,
          },
        };
      });
    }
  }
}
