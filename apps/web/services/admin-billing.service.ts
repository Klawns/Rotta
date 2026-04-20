import { apiClient } from '@/services/api';
import {
  normalizeAdminPricingPlan,
  type RawAdminPricingPlan,
} from '@/services/admin-service.utils';
import type {
  AdminBillingPlan,
  AdminBillingSummary,
} from '@/types/admin-billing';
import type { UpdatePricingPlanInput } from '@/types/admin';

export const adminBillingService = {
  async getSummary(signal?: AbortSignal): Promise<AdminBillingSummary> {
    return apiClient.get<AdminBillingSummary>('/admin/billing/summary', {
      signal,
    });
  },

  async getPlans(signal?: AbortSignal): Promise<AdminBillingPlan[]> {
    const plans = await apiClient.get<RawAdminPricingPlan[]>(
      '/admin/billing/plans',
      { signal },
    );

    return (plans || []).map(normalizeAdminPricingPlan);
  },

  async updatePlan(
    planId: string,
    data: UpdatePricingPlanInput,
  ): Promise<void> {
    const payload = {
      ...data,
      features: data.features ? JSON.stringify(data.features) : undefined,
    };

    return apiClient.patch(`/admin/billing/plans/${planId}`, payload);
  },
};

export default adminBillingService;
