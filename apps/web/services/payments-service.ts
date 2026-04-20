import { apiClient } from '@/services/api';
import { PaymentPlan } from '@/types/payments';
import { normalizePaymentPlanFeatures } from '@/services/payments-service.utils';

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
};

export default paymentsService;
