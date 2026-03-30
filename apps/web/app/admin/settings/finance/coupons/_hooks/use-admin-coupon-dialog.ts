'use client';

import { useState, type FormEvent } from 'react';
import { CreatePromoCodeInput, PromoCodeDuration } from '@/types/payments';

export type DiscountMode = 'PERCENTAGE' | 'FIXED';

interface UseAdminCouponDialogOptions {
  onSubmit: (data: CreatePromoCodeInput) => Promise<unknown>;
}

export function useAdminCouponDialog({
  onSubmit,
}: UseAdminCouponDialogOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountMode, setDiscountMode] = useState<DiscountMode>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState(0);
  const [duration, setDuration] = useState<PromoCodeDuration>('once');
  const [durationInMonths, setDurationInMonths] = useState(1);

  const resetForm = () => {
    setCode('');
    setDiscountMode('PERCENTAGE');
    setDiscountValue(0);
    setDuration('once');
    setDurationInMonths(1);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      resetForm();
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (discountValue <= 0) {
      return;
    }

    const payload: CreatePromoCodeInput = {
      code: code.trim().toUpperCase(),
      duration,
      ...(discountMode === 'PERCENTAGE'
        ? { percentOff: Number(discountValue) }
        : { amountOff: Number(discountValue) }),
      ...(duration === 'repeating'
        ? { durationInMonths: Number(durationInMonths) }
        : {}),
    };

    try {
      await onSubmit(payload);
      handleOpenChange(false);
    } catch {}
  };

  return {
    code,
    discountMode,
    discountValue,
    duration,
    durationInMonths,
    isOpen,
    setCode,
    setDiscountMode,
    setDiscountValue,
    setDuration,
    setDurationInMonths,
    handleOpenChange,
    handleSubmit,
  };
}
