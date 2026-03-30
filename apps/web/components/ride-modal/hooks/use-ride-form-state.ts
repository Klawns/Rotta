'use client';

import { useCallback, useState } from 'react';
import { type PaymentStatus, type RidePreset } from '@/types/rides';

interface UseRideFormStateProps {
  clientId?: string;
}

export function useRideFormState({ clientId }: UseRideFormStateProps) {
  const [selectedClientId, setSelectedClientId] = useState(clientId || '');
  const [value, setValue] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [rideDate, setRideDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [isCustomValue, setIsCustomValue] = useState(false);
  const [useBalance, setUseBalance] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newClientName, setNewClientName] = useState('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);

  const resetForm = useCallback(() => {
    setSelectedClientId(clientId || '');
    setValue('');
    setLocation('');
    setNotes('');
    setRideDate('');
    setIsCustomValue(false);
    setPhoto(null);
    setPaymentStatus('PAID');
    setUseBalance(false);
    setCurrentStep(clientId ? 2 : 1);
  }, [clientId]);

  const handlePresetClick = useCallback((preset: RidePreset) => {
    setValue(preset.value.toString());
    setLocation(preset.location || '');
    setIsCustomValue(false);
  }, []);

  return {
    selectedClientId,
    setSelectedClientId,
    value,
    setValue,
    location,
    setLocation,
    notes,
    setNotes,
    photo,
    setPhoto,
    rideDate,
    setRideDate,
    paymentStatus,
    setPaymentStatus,
    isCustomValue,
    setIsCustomValue,
    useBalance,
    setUseBalance,
    currentStep,
    setCurrentStep,
    newClientName,
    setNewClientName,
    isCreatingClient,
    setIsCreatingClient,
    resetForm,
    handlePresetClick,
  };
}
