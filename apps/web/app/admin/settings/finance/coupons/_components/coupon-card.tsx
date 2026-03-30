'use client';

import { Ticket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { PromoCode } from '@/types/payments';

interface CouponCardProps {
  coupon: PromoCode;
}

export function CouponCard({ coupon }: CouponCardProps) {
  return (
    <Card className="border-white/5 bg-slate-900/40">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-mono text-xl font-bold text-lime-400">
          {coupon.code}
        </CardTitle>
        <Ticket size={18} className="text-slate-500" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-slate-400">
          {coupon.notes || `Duração: ${coupon.duration}`}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-white">
            {coupon.percentOff
              ? `${coupon.percentOff}%`
              : formatCurrency((coupon.amountOff || 0) / 100)}
          </div>
          <div className="text-xs uppercase tracking-wider text-slate-500">
            de desconto
          </div>
        </div>
        <div className="text-xs text-slate-500">
          {coupon.useCount || 0} usos
          {coupon.maxRedeems ? ` de ${coupon.maxRedeems}` : ''}
        </div>
        {coupon.duration === 'repeating' && coupon.durationInMonths ? (
          <div className="text-xs text-slate-500">
            Aplicado por {coupon.durationInMonths} meses
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
