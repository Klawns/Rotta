'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  createRidePhotoState,
  type RidePhotoState,
  revokeRidePhotoPreview,
} from '@/lib/ride-photo';
import { type PaymentStatus, type RidePreset } from '@/types/rides';

interface UseRideFormStateProps {
  clientId?: string;
}

export type RideValueSelectionMode = 'picker' | 'custom-edit' | 'summary';

export function useRideFormState({ clientId }: UseRideFormStateProps) {
  const [selectedClientId, setSelectedClientId] = useState(clientId || '');
  const [value, setValue] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<RidePhotoState>(() =>
    createRidePhotoState(),
  );
  const [rideDate, setRideDate] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('PAID');
  const [valueSelectionMode, setValueSelectionMode] =
    useState<RideValueSelectionMode>('picker');
  const [useBalance, setUseBalance] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [newClientName, setNewClientName] = useState('');
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [clientSearch, setClientSearch] = useState('');

  useEffect(() => {
    return () => {
      revokeRidePhotoPreview(photo);
    };
  }, [photo]);

  const resetForm = useCallback(() => {
    setSelectedClientId(clientId || '');
    setValue('');
    setLocation('');
    setNotes('');
    setRideDate('');
    setValueSelectionMode('picker');
    setPhoto(createRidePhotoState());
    setPaymentStatus('PAID');
    setUseBalance(false);
    setCurrentStep(clientId ? 2 : 1);
    setClientSearch('');
  }, [clientId]);

  const removePhoto = useCallback(() => {
    setPhoto(createRidePhotoState());
  }, []);

  const handlePresetClick = useCallback((preset: RidePreset) => {
    setValue(preset.value.toString());
    setLocation(preset.location || '');
    setValueSelectionMode('summary');
  }, []);

  const handleQuickValueSelection = useCallback((quickValue: number) => {
    setValue(quickValue.toString());
    setValueSelectionMode('summary');
  }, []);

  const startCustomValueEntry = useCallback(() => {
    setValue('');
    setLocation('');
    setValueSelectionMode('custom-edit');
  }, []);

  const confirmCustomValue = useCallback(() => {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return;
    }

    setValueSelectionMode('summary');
  }, [value]);

  const resetValueSelection = useCallback(() => {
    setValue('');
    setValueSelectionMode('picker');
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
    removePhoto,
    rideDate,
    setRideDate,
    paymentStatus,
    setPaymentStatus,
    valueSelectionMode,
    setValueSelectionMode,
    useBalance,
    setUseBalance,
    currentStep,
    setCurrentStep,
    newClientName,
    setNewClientName,
    isCreatingClient,
    setIsCreatingClient,
    clientSearch,
    setClientSearch,
    resetForm,
    handlePresetClick,
    handleQuickValueSelection,
    startCustomValueEntry,
    confirmCustomValue,
    resetValueSelection,
  };
}
