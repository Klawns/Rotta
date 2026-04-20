'use client';

import { Ticket } from 'lucide-react';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { PromoCode } from '@/types/payments';

interface CouponCardProps {
  coupon: PromoCode;
}

export function CouponCard({ coupon }: CouponCardProps) {
  return (
    <Card className="rounded-[2rem] border-border/80 bg-white/80 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-mono text-xl font-bold text-lime-700">
          {coupon.code}
        </CardTitle>
        <Ticket size={18} className="text-slate-400" />
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-sm text-slate-500">
          {coupon.notes || `Duracao: ${coupon.duration}`}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-2xl font-bold text-slate-950">
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
