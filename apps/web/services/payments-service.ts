import { apiClient } from '@/services/api';
import {
  CreatePromoCodeInput,
  PaymentPlan,
  PromoCode,
} from '@/types/payments';
import {
  normalizePaymentPlanFeatures,
  normalizePromoCode,
} from '@/services/payments-service.utils';

export const paymentsService = {
  async getPlans(signal?: AbortSignal): Promise<PaymentPlan[]> {
    const plans = await apiClient.get<Array<Omit<PaymentPlan, 'features'> & {
      features: unknown;
    }>>('/payments/plans', {
      signal,
    });

    return (plans || []).map((plan) => ({
      ...plan,
      features: normalizePaymentPlanFeatures(plan.features),
    }));
  },

  async getPromoCodes(signal?: AbortSignal): Promise<PromoCode[]> {
    const promoCodes = await apiClient.get<unknown[]>(
      '/admin/settings/promo-codes',
      { signal },
    );

    return (promoCodes || []).map(normalizePromoCode);
  },

  async createPromoCode(
    data: CreatePromoCodeInput,
  ): Promise<PromoCode> {
    const promoCode = await apiClient.post<unknown>(
      '/admin/settings/promo-codes',
      data,
    );

    return normalizePromoCode(promoCode);
  },
};

export default paymentsService;
