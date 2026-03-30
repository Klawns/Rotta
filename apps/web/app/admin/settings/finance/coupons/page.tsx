'use client';

import { Loader2 } from 'lucide-react';
import { CouponCard } from './_components/coupon-card';
import { CouponCreateDialog } from './_components/coupon-create-dialog';
import { useAdminCoupons } from './_hooks/use-admin-coupons';
import { useAdminCouponDialog } from './_hooks/use-admin-coupon-dialog';

export default function CouponsPage() {
  const { coupons, isLoading, isCreating, createCoupon } = useAdminCoupons();
  const couponDialog = useAdminCouponDialog({
    onSubmit: createCoupon,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold text-white">
            Cupons e Descontos
          </h1>
          <p className="text-slate-400">
            Emita códigos de desconto alinhados ao DTO atual do backend.
          </p>
        </div>
        <CouponCreateDialog dialog={couponDialog} isSubmitting={isCreating} />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {coupons.length === 0 ? (
          <div className="col-span-full rounded-[2rem] border border-dashed border-white/5 py-12 text-center text-slate-500">
            Nenhum cupom emitido até agora.
          </div>
        ) : (
          coupons.map((coupon) => (
            <CouponCard key={coupon.id || coupon.code} coupon={coupon} />
          ))
        )}
      </div>
    </div>
  );
}
