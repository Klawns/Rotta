import { Injectable, Inject } from '@nestjs/common';
import {
  IAdminSettingsRepository,
  type PricingPlanUpdate,
} from './interfaces/admin-settings-repository.interface';
import type { PaymentPlanId } from '../payments/pricing-plan-catalog';
import { CACHE_PROVIDER } from '../cache/interfaces/cache-provider.interface';
import type { ICacheProvider } from '../cache/interfaces/cache-provider.interface';

@Injectable()
export class AdminSettingsService {
  constructor(
    @Inject(IAdminSettingsRepository)
    private readonly adminSettingsRepository: IAdminSettingsRepository,
    @Inject(CACHE_PROVIDER)
    private readonly cache: ICacheProvider,
  ) {}

  async getPlans() {
    return this.adminSettingsRepository.getPlans();
  }

  async updatePlan(id: PaymentPlanId, data: PricingPlanUpdate): Promise<void> {
    await this.adminSettingsRepository.updatePlan(id, data);
    await this.cache.del('pricing:all_plans');
  }

  async getConfigs() {
    return this.adminSettingsRepository.getConfigs();
  }

  async updateConfig(key: string, value: string, description?: string) {
    return this.adminSettingsRepository.updateConfig(key, value, description);
  }

  async seedInitialData() {
    await this.adminSettingsRepository.seedInitialData();
    await this.cache.del('pricing:all_plans');
  }
}
