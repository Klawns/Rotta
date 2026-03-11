import { Injectable, Inject } from '@nestjs/common';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { eq, and } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import * as schema from '@mdc/database';

import { DRIZZLE } from '../../database/database.provider';
import {
  ISettingsRepository,
  RidePreset,
  CreateRidePresetDto,
  UpdateRidePresetDto,
} from '../interfaces/settings-repository.interface';

@Injectable()
export class DrizzleSettingsRepository implements ISettingsRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: LibSQLDatabase<typeof schema>,
  ) {}

  async getRidePresets(userId: string): Promise<RidePreset[]> {
    return this.db
      .select()
      .from(schema.ridePresets)
      .where(eq(schema.ridePresets.userId, userId));
  }

  async createRidePreset(
    data: Omit<CreateRidePresetDto, 'id'> & { id?: string },
  ): Promise<RidePreset> {
    const results = await this.db
      .insert(schema.ridePresets)
      .values({
        ...data,
        id: data.id || randomUUID(),
      } as any)
      .returning();

    return results[0];
  }

  async deleteRidePreset(userId: string, id: string): Promise<void> {
    await this.db
      .delete(schema.ridePresets)
      .where(
        and(
          eq(schema.ridePresets.id, id),
          eq(schema.ridePresets.userId, userId),
        ),
      );
  }

  async updateRidePreset(
    userId: string,
    id: string,
    data: UpdateRidePresetDto,
  ): Promise<RidePreset[]> {
    return this.db
      .update(schema.ridePresets)
      .set(data as any)
      .where(
        and(
          eq(schema.ridePresets.id, id),
          eq(schema.ridePresets.userId, userId),
        ),
      )
      .returning();
  }
}
