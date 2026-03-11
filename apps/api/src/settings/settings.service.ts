import { Injectable, Inject } from '@nestjs/common';
import { ISettingsRepository } from './interfaces/settings-repository.interface';

@Injectable()
export class SettingsService {
  constructor(
    @Inject(ISettingsRepository)
    private readonly settingsRepository: ISettingsRepository,
  ) {}

  async getRidePresets(userId: string) {
    const presets = await this.settingsRepository.getRidePresets(userId);

    // Se não tiver nenhum preset, cria os padrões
    if (presets.length === 0) {
      return this.seedDefaultPresets(userId);
    }

    return presets;
  }

  async seedDefaultPresets(userId: string) {
    const defaults = [
      { label: 'Centro', value: 5.0, location: 'Centro' },
      { label: 'Bairro A', value: 7.0, location: 'Bairro A' },
      { label: 'Bairro B', value: 10.0, location: 'Bairro B' },
      { label: 'Shopping', value: 12.0, location: 'Shopping' },
    ];

    const created = [];
    for (const item of defaults) {
      const res = await this.settingsRepository.createRidePreset({
        ...item,
        userId,
      });
      created.push(res);
    }

    return created;
  }

  async createRidePreset(
    userId: string,
    data: { label: string; value: number; location: string },
  ) {
    return this.settingsRepository.createRidePreset({
      ...data,
      userId,
    });
  }

  async deleteRidePreset(userId: string, id: string) {
    return this.settingsRepository.deleteRidePreset(userId, id);
  }

  async updateRidePreset(
    userId: string,
    id: string,
    data: Partial<{ label: string; value: number; location: string }>,
  ) {
    return this.settingsRepository.updateRidePreset(userId, id, data);
  }
}
