import { ApiEnvelope } from '@/services/api';
import { PaymentPlan, PaymentPlanId } from '@/types/payments';

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  revenue30d: number;
}

export interface AdminRecentUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  plan: PaymentPlanId | null;
  validUntil: string | null;
  daysLeft: number | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type AdminRecentUsersResponse = ApiEnvelope<
  AdminRecentUser[],
  PaginationMeta
>;

export interface CreateAdminUserInput {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface UpdateAdminUserPlanInput {
  userId: string;
  plan: PaymentPlanId;
}

export interface UpdatePricingPlanInput {
  name?: string;
  price?: number;
  interval?: string;
  description?: string;
  features?: string[];
  cta?: string;
  highlight?: boolean;
}

export type AdminPricingPlan = PaymentPlan;

export type AdminConfigs = Record<string, string>;

export interface UpdateAdminConfigInput {
  key: string;
  value: string;
  description?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
