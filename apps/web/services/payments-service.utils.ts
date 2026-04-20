import type { PaymentPlan } from '@/types/payments';

export type RawPaymentPlan = Omit<PaymentPlan, 'features'> & {
  features: unknown;
};

export function normalizePaymentPlanFeatures(features: unknown): string[] {
  if (Array.isArray(features)) {
    return features.filter(
      (feature): feature is string => typeof feature === 'string',
    );
  }

  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      return Array.isArray(parsed)
        ? parsed.filter(
            (feature): feature is string => typeof feature === 'string',
          )
        : [];
    } catch {
      return [];
    }
  }

  return [];
}
