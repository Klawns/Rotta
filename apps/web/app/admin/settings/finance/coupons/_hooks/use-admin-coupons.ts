'use client';

import { CreatePromoCodeInput } from '@/types/payments';
import { useAdminCouponsQuery } from './use-admin-coupons-query';
import { useCreateAdminCoupon } from './use-create-admin-coupon';

export function useAdminCoupons() {
  const couponsQuery = useAdminCouponsQuery();
  const createCouponMutation = useCreateAdminCoupon();

  return {
    coupons: couponsQuery.data ?? [],
    isLoading: couponsQuery.isLoading,
    isCreating: createCouponMutation.isPending,
    createCoupon: (data: CreatePromoCodeInput) =>
      createCouponMutation.mutateAsync(data),
  };
}
