import { Injectable, Inject } from '@nestjs/common';
import { PAYMENT_PROVIDER } from '../payments/providers/payment-provider.interface';
import type { IPaymentProvider } from '../payments/providers/payment-provider.interface';
import { IAdminSettingsRepository } from './interfaces/admin-settings-repository.interface';

@Injectable()
export class AdminSettingsService {
  constructor(
    @Inject(IAdminSettingsRepository)
    private readonly adminSettingsRepository: IAdminSettingsRepository,
    @Inject(PAYMENT_PROVIDER)
    private provider: IPaymentProvider,
  ) {}

  async listCoupons() {
    if (!this.provider.listCoupons) {
      throw new Error('Provedor de pagamento não suporta listagem de cupons');
    }
    return this.provider.listCoupons();
  }

  async createCoupon(data: any) {
    if (!this.provider.createCoupon) {
      throw new Error('Provedor de pagamento não suporta criação de cupons');
    }
    return this.provider.createCoupon(data);
  }

  async getPlans() {
    return this.adminSettingsRepository.getPlans();
  }

  async updatePlan(id: string, data: any) {
    return this.adminSettingsRepository.updatePlan(id, data);
  }

  async getConfigs() {
    return this.adminSettingsRepository.getConfigs();
  }

  async updateConfig(key: string, value: string, description?: string) {
    return this.adminSettingsRepository.updateConfig(key, value, description);
  }

  async seedInitialData() {
    return this.adminSettingsRepository.seedInitialData();
  }
}
