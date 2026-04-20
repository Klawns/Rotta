import { apiClient } from '@/services/api';
import {
  AdminConfigs,
  AdminPricingPlan,
  AdminRecentUsersResponse,
  AdminStats,
  ChangePasswordInput,
  CreateAdminUserInput,
  PaginationMeta,
  UpdateAdminConfigInput,
  UpdateAdminUserPlanInput,
  UpdatePricingPlanInput,
} from '@/types/admin';
import {
  normalizeAdminPricingPlan,
  type RawAdminPricingPlan,
} from '@/services/admin-service.utils';

export const adminService = {
  async getStats(signal?: AbortSignal): Promise<AdminStats> {
    return apiClient.get<AdminStats>('/admin/stats', { signal });
  },

  async getRecentUsers(
    params: {
      page: number;
      limit: number;
    },
    signal?: AbortSignal,
  ): Promise<AdminRecentUsersResponse> {
    return apiClient.getPaginated<AdminRecentUsersResponse['data'], PaginationMeta>(
      '/admin/users/recent',
      {
      params,
      signal,
      },
    );
  },

  async createUser(data: CreateAdminUserInput) {
    return apiClient.post('/admin/users', data);
  },

  async deleteUser(userId: string): Promise<void> {
    return apiClient.delete(`/admin/users/${userId}`);
  },

  async updateUserPlan({
    userId,
    plan,
  }: UpdateAdminUserPlanInput): Promise<void> {
    return apiClient.put(`/admin/users/${userId}/plan`, { plan });
  },

  async getPlans(signal?: AbortSignal): Promise<AdminPricingPlan[]> {
    const plans = await apiClient.get<RawAdminPricingPlan[]>(
      '/admin/settings/plans',
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

    return apiClient.patch(`/admin/settings/plans/${planId}`, payload);
  },

  async getConfigs(signal?: AbortSignal): Promise<AdminConfigs> {
    return apiClient.get<AdminConfigs>('/admin/settings/configs', {
      signal,
    });
  },

  async updateConfig(data: UpdateAdminConfigInput): Promise<void> {
    return apiClient.post('/admin/settings/configs', data);
  },

  async changePassword(data: ChangePasswordInput): Promise<void> {
    return apiClient.patch('/auth/change-password', data);
  },
};

export default adminService;
