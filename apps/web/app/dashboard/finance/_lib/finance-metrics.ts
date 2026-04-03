import type {
  FinanceByClient,
  FinanceByStatus,
  RecentRide,
} from '@/services/finance-service';
import type { ClientDirectoryEntry } from '@/types/rides';

export function sumStatusValue(
  data: FinanceByStatus[],
  status: FinanceByStatus['status'],
) {
  return data
    .filter((item) => item.status === status)
    .reduce((total, item) => total + Number(item.value || 0), 0);
}

export function getFinanceStatusTotals(data: FinanceByStatus[]) {
  const paidValue = sumStatusValue(data, 'PAID');
  const pendingValue = sumStatusValue(data, 'PENDING');
  const total = paidValue + pendingValue;

  return {
    paidValue,
    pendingValue,
    collectionRate: total > 0 ? (paidValue / total) * 100 : 0,
  };
}

export function getSortedClients(data: FinanceByClient[]) {
  return [...data].sort((left, right) => right.value - left.value);
}

export function getLatestRide(rides: RecentRide[]) {
  return [...rides].sort((left, right) => {
    const leftTime = Date.parse(left.rideDate || '');
    const rightTime = Date.parse(right.rideDate || '');

    return rightTime - leftTime;
  })[0] ?? null;
}

export function getTopLocation(rides: RecentRide[]) {
  const counts = rides.reduce<Record<string, number>>((accumulator, ride) => {
    if (!ride.location) {
      return accumulator;
    }

    accumulator[ride.location] = (accumulator[ride.location] || 0) + 1;

    return accumulator;
  }, {});

  return (
    Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] ||
    null
  );
}

export function getSelectedClientName(
  clients: ClientDirectoryEntry[],
  clientId?: string,
) {
  if (!clientId) {
    return null;
  }

  return clients.find((client) => client.id === clientId)?.name || null;
}
