import { rideLifecycleEvents } from '@mdc/database';

export type RideLifecycleEvent = typeof rideLifecycleEvents.$inferSelect;
export type CreateRideLifecycleEventDto =
  typeof rideLifecycleEvents.$inferInsert;

export const IRideLifecycleEventsRepository = Symbol(
  'IRideLifecycleEventsRepository',
);

export interface IRideLifecycleEventsRepository {
  create(data: CreateRideLifecycleEventDto, executor?: unknown): Promise<void>;
  createMany(
    data: CreateRideLifecycleEventDto[],
    executor?: unknown,
  ): Promise<void>;
}
