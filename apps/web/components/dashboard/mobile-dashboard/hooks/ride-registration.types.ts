"use client";

import type { ChangeEvent } from "react";
import type { PaymentStatus, Ride } from "@/types/rides";

export interface RideFormState {
    selectedPresetId: string | null;
    customValue: string;
    customLocation: string;
    showCustomForm: boolean;
    paymentStatus: PaymentStatus;
    rideDate: string;
    notes: string;
    photo: string | null;
    isSaving: boolean;
    canSubmit: boolean;
}

export interface RideFormActions {
    setCustomValue: (value: string) => void;
    setCustomLocation: (location: string) => void;
    setPaymentStatus: (status: PaymentStatus) => void;
    setRideDate: (date: string) => void;
    setNotes: (notes: string) => void;
    handlePresetSelect: (id: string, value: number, location?: string) => void;
    toggleCustomForm: () => void;
    handlePhotoChange: (event: ChangeEvent<HTMLInputElement>) => void;
    removePhoto: () => void;
    submitRide: () => Promise<void>;
    resetForm: () => void;
}

export interface RideRegistrationModals {
    rideToEdit: Ride | null;
    setRideToEdit: (ride: Ride | null) => void;
    rideToDelete: Ride | null;
    setRideToDelete: (ride: Ride | null) => void;
    isDeleting: boolean;
    handleDeleteRide: () => Promise<void>;
}
