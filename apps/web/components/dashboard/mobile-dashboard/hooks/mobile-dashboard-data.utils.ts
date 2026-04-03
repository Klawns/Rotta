import { type RideViewModel } from '@/types/rides';

export function getUniqueRides(rides: RideViewModel[]) {
  return Array.from(
    new Map(
      rides.filter((ride) => ride?.id).map((ride) => [String(ride.id), ride]),
    ).values(),
  );
}
