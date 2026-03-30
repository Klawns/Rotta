'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { useSearchParams } from 'next/navigation';
import {
  registerCellphoneSchema,
  type RegisterCellphoneFormValues,
} from '../schemas/register-cellphone-schema';
import { startGoogleAuth } from '../services/auth-google-service';
import {
  formatCellphone,
  isValidCellphone,
  normalizeCellphone,
} from '../utils/cellphone';

export function useRegisterFlow() {
  const searchParams = useSearchParams();
  const [validatedCellphone, setValidatedCellphone] = useState('');
  const plan = searchParams.get('plan') || 'starter';
  const form = useForm<RegisterCellphoneFormValues>({
    resolver: zodResolver(registerCellphoneSchema),
    mode: 'onChange',
    defaultValues: {
      cellphone: '',
    },
  });
  const cellphone = useWatch({
    control: form.control,
    name: 'cellphone',
  });
  const normalizedCellphone = normalizeCellphone(cellphone ?? '');
  const canContinueWithGoogle = isValidCellphone(cellphone ?? '');
  const isCellphoneValidated =
    canContinueWithGoogle && validatedCellphone === normalizedCellphone;

  const handleCellphoneChange = (value: string) => {
    form.setValue('cellphone', formatCellphone(value), {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleCellphoneRegister = async () => {
    const isValid = await form.trigger('cellphone');

    if (!isValid) {
      return;
    }

    setValidatedCellphone(normalizedCellphone);
  };

  const handleGoogleRegister = form.handleSubmit(({ cellphone: value }) => {
    setValidatedCellphone(normalizeCellphone(value));
    startGoogleAuth({
      plan,
      cellphone: normalizeCellphone(value),
    });
  });

  return {
    form,
    plan,
    canContinueWithGoogle,
    isCellphoneValidated,
    handleCellphoneChange,
    handleCellphoneRegister,
    handleGoogleRegister,
  };
}
