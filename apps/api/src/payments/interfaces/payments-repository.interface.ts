import { pricingPlans } from '@mdc/database';

export type PricingPlan = typeof pricingPlans.$inferSelect;

export const IPaymentsRepository = Symbol('IPaymentsRepository');

export interface IPaymentsRepository {
  getPlanById(id: string): Promise<PricingPlan | undefined>;
  getAllPlans(): Promise<PricingPlan[]>;
}
