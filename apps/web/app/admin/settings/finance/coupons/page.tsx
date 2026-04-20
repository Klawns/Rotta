'use client';

import {
  AdminEmptyState,
  AdminLoadingState,
  AdminPage,
  AdminPageHeader,
} from '@/app/admin/_components/admin-ui';
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
      <AdminLoadingState
        title="Carregando cupons"
        description="Buscando descontos ativos para exibicao no shell admin."
      />
    );
  }

  return (
    <AdminPage>
      <AdminPageHeader
        badge="Faturamento"
        title="Cupons e descontos"
        description="Emita codigos de desconto alinhados ao DTO atual do backend."
        actions={
          <CouponCreateDialog dialog={couponDialog} isSubmitting={isCreating} />
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {coupons.length === 0 ? (
          <div className="col-span-full">
            <AdminEmptyState
              title="Nenhum cupom emitido ate agora"
              description="Crie o primeiro desconto para disponibilizar campanhas promocionais."
            />
          </div>
        ) : (
          coupons.map((coupon) => (
            <CouponCard key={coupon.id || coupon.code} coupon={coupon} />
          ))
        )}
      </div>
    </AdminPage>
  );
}
