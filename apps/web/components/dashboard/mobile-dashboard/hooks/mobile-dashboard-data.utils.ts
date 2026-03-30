import { type Ride } from '@/types/rides';

export function getUniqueRides(rides: Ride[]) {
  return Array.from(
    new Map(
      rides.filter((ride) => ride?.id).map((ride) => [String(ride.id), ride]),
    ).values(),
  );
}
