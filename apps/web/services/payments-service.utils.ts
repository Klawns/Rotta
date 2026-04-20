import type { PaymentPlan, PromoCode } from '@/types/payments';

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

export function normalizePromoCode(payload: unknown): PromoCode {
  const source =
    payload && typeof payload === 'object'
      ? (payload as Record<string, unknown>)
      : {};

  return {
    id: typeof source.id === 'string' ? source.id : undefined,
    code: typeof source.code === 'string' ? source.code : '',
    notes:
      typeof source.notes === 'string'
        ? source.notes
        : typeof source.name === 'string'
          ? source.name
          : null,
    percentOff:
      typeof source.percentOff === 'number'
        ? source.percentOff
        : typeof source.percent_off === 'number'
          ? source.percent_off
          : null,
    amountOff:
      typeof source.amountOff === 'number'
        ? source.amountOff
        : typeof source.amount_off === 'number'
          ? source.amount_off
          : null,
    duration:
      source.duration === 'repeating' ||
      source.duration === 'forever' ||
      source.duration === 'once'
        ? source.duration
        : 'once',
    durationInMonths:
      typeof source.durationInMonths === 'number'
        ? source.durationInMonths
        : typeof source.duration_in_months === 'number'
          ? source.duration_in_months
          : null,
    useCount:
      typeof source.useCount === 'number'
        ? source.useCount
        : typeof source.timesRedeemed === 'number'
          ? source.timesRedeemed
          : typeof source.times_redeemed === 'number'
            ? source.times_redeemed
            : null,
    maxRedeems:
      typeof source.maxRedeems === 'number'
        ? source.maxRedeems
        : typeof source.max_redemptions === 'number'
          ? source.max_redemptions
          : null,
  };
}
