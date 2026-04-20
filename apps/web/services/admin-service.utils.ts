import type { AdminPricingPlan } from '@/types/admin';

export type RawAdminPricingPlan = Omit<AdminPricingPlan, 'features'> & {
  features: unknown;
};

export function normalizeAdminPricingPlan(
  plan: RawAdminPricingPlan,
): AdminPricingPlan {
  if (Array.isArray(plan.features)) {
    return {
      ...plan,
      features: plan.features.filter(
        (feature): feature is string => typeof feature === 'string',
      ),
    };
  }

  if (typeof plan.features === 'string') {
    try {
      const features = JSON.parse(plan.features);
      return {
        ...plan,
        features: Array.isArray(features) ? features : [],
      };
    } catch {
      return {
        ...plan,
        features: [],
      };
    }
  }

  return {
    ...plan,
    features: [],
  };
}
