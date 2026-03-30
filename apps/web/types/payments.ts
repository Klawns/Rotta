export type PaymentPlanId = 'starter' | 'premium' | 'lifetime';

export interface PaymentPlan {
  id: PaymentPlanId;
  name: string;
  price: number;
  interval?: string | null;
  description: string;
  features: string[];
  cta: string;
  highlight: boolean;
}

export type PromoCodeDuration = 'once' | 'repeating' | 'forever';

export interface PromoCode {
  id?: string;
  code: string;
  notes?: string | null;
  percentOff?: number | null;
  amountOff?: number | null;
  duration: PromoCodeDuration;
  durationInMonths?: number | null;
  useCount?: number | null;
  maxRedeems?: number | null;
}

export interface CreatePromoCodeInput {
  code: string;
  percentOff?: number;
  amountOff?: number;
  duration: PromoCodeDuration;
  durationInMonths?: number;
}
