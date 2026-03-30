import { apiClient } from '@/services/api';
import {
  CreateRidePresetInput,
  RidePreset,
  UpdateRidePresetInput,
} from '@/types/settings';

export const settingsService = {
  async getRidePresets(signal?: AbortSignal): Promise<RidePreset[]> {
    return apiClient.get<RidePreset[]>('/settings/ride-presets', {
      signal,
    });
  },

  async markTutorialSeen(): Promise<void> {
    await apiClient.patch('/settings/tutorial-seen');
  },

  async createRidePreset(
    data: CreateRidePresetInput,
  ): Promise<RidePreset> {
    return apiClient.post<RidePreset>('/settings/ride-presets', data);
  },

  async updateRidePreset(
    presetId: string,
    data: UpdateRidePresetInput,
  ): Promise<RidePreset> {
    return apiClient.patch<RidePreset>(
      `/settings/ride-presets/${presetId}`,
      data,
    );
  },

  async deleteRidePreset(presetId: string): Promise<void> {
    return apiClient.delete(`/settings/ride-presets/${presetId}`);
  },
};

export default settingsService;
