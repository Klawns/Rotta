import { pricingPlans, systemConfigs } from '@mdc/database';

export type PricingPlan = typeof pricingPlans.$inferSelect;
export type SystemConfig = typeof systemConfigs.$inferSelect;

export const IAdminSettingsRepository = Symbol('IAdminSettingsRepository');

export interface IAdminSettingsRepository {
  getPlans(): Promise<PricingPlan[]>;
  updatePlan(id: string, data: any): Promise<void>;

  getConfigs(): Promise<Record<string, string>>;
  updateConfig(key: string, value: string, description?: string): Promise<void>;

  seedInitialData(): Promise<void>;
}
