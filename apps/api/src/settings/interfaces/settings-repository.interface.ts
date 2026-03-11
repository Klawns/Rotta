import { ridePresets } from '@mdc/database';

export type RidePreset = typeof ridePresets.$inferSelect;
export type CreateRidePresetDto = typeof ridePresets.$inferInsert;
export type UpdateRidePresetDto = Partial<CreateRidePresetDto>;

export const ISettingsRepository = Symbol('ISettingsRepository');

export interface ISettingsRepository {
  getRidePresets(userId: string): Promise<RidePreset[]>;
  createRidePreset(
    data: Omit<CreateRidePresetDto, 'id'> & { id?: string },
  ): Promise<RidePreset>;
  deleteRidePreset(userId: string, id: string): Promise<void>;
  updateRidePreset(
    userId: string,
    id: string,
    data: UpdateRidePresetDto,
  ): Promise<RidePreset[]>;
}
