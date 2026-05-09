/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call -- Drizzle executors are consumed behind a runtime boundary in this repository. */
import { Inject, Injectable } from '@nestjs/common';
import { DRIZZLE } from '../../database/database.provider';
import type { DrizzleClient } from '../../database/database.provider';
import {
  CreateRideLifecycleEventDto,
  IRideLifecycleEventsRepository,
} from '../interfaces/ride-lifecycle-events-repository.interface';

@Injectable()
export class DrizzleRideLifecycleEventsRepository
  implements IRideLifecycleEventsRepository
{
  constructor(
    @Inject(DRIZZLE)
    private readonly drizzle: DrizzleClient,
  ) {}

  private get db() {
    return this.drizzle.db;
  }

  private get schema() {
    return this.drizzle.schema;
  }

  private getExecutor(executor?: unknown) {
    return executor ?? this.db;
  }

  async create(data: CreateRideLifecycleEventDto, executor?: unknown) {
    await this.getExecutor(executor)
      .insert(this.schema.rideLifecycleEvents)
      .values(data as any);
  }

  async createMany(data: CreateRideLifecycleEventDto[], executor?: unknown) {
    if (data.length === 0) {
      return;
    }

    await this.getExecutor(executor)
      .insert(this.schema.rideLifecycleEvents)
      .values(data as any);
  }
}
