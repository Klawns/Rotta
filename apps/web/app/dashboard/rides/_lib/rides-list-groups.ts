import { resolveRideDateValue } from '@/lib/date-utils';
import type { RideViewModel } from '@/types/rides';

export interface RideDateGroup {
  id: string;
  label: string;
  rides: RideViewModel[];
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatGroupLabel(date: Date, now: Date) {
  const today = startOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return 'Hoje';
  }

  if (isSameDay(date, yesterday)) {
    return 'Ontem';
  }

  const isCurrentYear = date.getFullYear() === now.getFullYear();

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  });
}

export function groupRidesByDate(rides: RideViewModel[], now: Date = new Date()) {
  const sortedRides = [...rides].sort((left, right) => {
    const leftDate = resolveRideDateValue(left.rideDate, left.createdAt)?.getTime() ?? 0;
    const rightDate = resolveRideDateValue(right.rideDate, right.createdAt)?.getTime() ?? 0;

    return rightDate - leftDate;
  });

  const groups = new Map<string, RideDateGroup>();

  sortedRides.forEach((ride) => {
    const rideDate = resolveRideDateValue(ride.rideDate, ride.createdAt);
    const groupId = rideDate
      ? `${rideDate.getFullYear()}-${rideDate.getMonth()}-${rideDate.getDate()}`
      : 'sem-data';

    if (!groups.has(groupId)) {
      groups.set(groupId, {
        id: groupId,
        label: rideDate ? formatGroupLabel(rideDate, now) : 'Sem data',
        rides: [],
      });
    }

    groups.get(groupId)?.rides.push(ride);
  });

  return Array.from(groups.values());
}
