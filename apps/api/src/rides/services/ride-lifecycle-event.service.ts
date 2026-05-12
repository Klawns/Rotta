import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  CreateRideLifecycleEventDto,
  IRideLifecycleEventsRepository,
} from '../interfaces/ride-lifecycle-events-repository.interface';
import type { Ride } from '../interfaces/rides-repository.interface';

type RideStatus = Ride['status'];
type RidePaymentStatus = Ride['paymentStatus'];

type RideIdentity = Pick<Ride, 'id' | 'userId'>;

type ArchivedRideIdentity = RideIdentity & {
  archiveReason?: string | null;
};

@Injectable()
export class RideLifecycleEventService {
  constructor(
    @Inject(IRideLifecycleEventsRepository)
    private readonly rideLifecycleEventsRepository: IRideLifecycleEventsRepository,
  ) {}

  async recordCreated(
    actorUserId: string,
    ride: RideIdentity,
    executor?: unknown,
  ) {
    await this.rideLifecycleEventsRepository.create(
      this.buildBaseEvent({
        rideId: ride.id,
        rideUserId: ride.userId,
        actorUserId,
        eventType: 'CREATED',
      }),
      executor,
    );
  }

  async recordArchived(
    actorUserId: string,
    rides: ArchivedRideIdentity[],
    executor?: unknown,
  ) {
    await this.rideLifecycleEventsRepository.createMany(
      rides.map((ride) =>
        this.buildBaseEvent({
          rideId: ride.id,
          rideUserId: ride.userId,
          actorUserId,
          eventType: 'ARCHIVED',
          metadataJson: ride.archiveReason
            ? { archiveReason: ride.archiveReason }
            : null,
        }),
      ),
      executor,
    );
  }

  async recordRestored(
    actorUserId: string,
    rides: RideIdentity[],
    executor?: unknown,
  ) {
    await this.rideLifecycleEventsRepository.createMany(
      rides.map((ride) =>
        this.buildBaseEvent({
          rideId: ride.id,
          rideUserId: ride.userId,
          actorUserId,
          eventType: 'RESTORED',
        }),
      ),
      executor,
    );
  }

  async recordStatusChanged(
    actorUserId: string,
    ride: RideIdentity & { status: RideStatus },
    nextStatus: RideStatus,
    executor?: unknown,
  ) {
    await this.rideLifecycleEventsRepository.create(
      this.buildBaseEvent({
        rideId: ride.id,
        rideUserId: ride.userId,
        actorUserId,
        eventType: 'STATUS_CHANGED',
        previousStatus: ride.status,
        nextStatus,
      }),
      executor,
    );
  }

  async recordPaymentStatusChanged(
    actorUserId: string,
    ride: RideIdentity & { paymentStatus: RidePaymentStatus },
    nextPaymentStatus: RidePaymentStatus,
    executor?: unknown,
  ) {
    await this.rideLifecycleEventsRepository.create(
      this.buildBaseEvent({
        rideId: ride.id,
        rideUserId: ride.userId,
        actorUserId,
        eventType: 'PAYMENT_STATUS_CHANGED',
        previousPaymentStatus: ride.paymentStatus,
        nextPaymentStatus,
      }),
      executor,
    );
  }

  private buildBaseEvent(
    input: Omit<
      CreateRideLifecycleEventDto,
      'id' | 'createdAt' | 'metadataJson'
    > & {
      metadataJson?: Record<string, unknown> | null;
    },
  ): CreateRideLifecycleEventDto {
    return {
      id: randomUUID(),
      rideId: input.rideId,
      rideUserId: input.rideUserId,
      actorUserId: input.actorUserId ?? null,
      eventType: input.eventType,
      previousStatus: input.previousStatus ?? null,
      nextStatus: input.nextStatus ?? null,
      previousPaymentStatus: input.previousPaymentStatus ?? null,
      nextPaymentStatus: input.nextPaymentStatus ?? null,
      metadataJson: input.metadataJson
        ? JSON.stringify(input.metadataJson)
        : null,
      createdAt: new Date(),
    };
  }
}
