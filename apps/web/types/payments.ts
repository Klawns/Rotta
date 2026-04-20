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
