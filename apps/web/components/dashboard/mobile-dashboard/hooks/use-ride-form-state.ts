"use client";

import { useCallback, useState, type ChangeEvent } from "react";
import type { PaymentStatus } from "@/types/rides";

interface UseRideFormStateProps {
    onReset?: () => void;
}

export function useRideFormState({ onReset }: UseRideFormStateProps = {}) {
    const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
    const [customValue, setCustomValue] = useState("");
    const [customLocation, setCustomLocation] = useState("");
    const [showCustomForm, setShowCustomForm] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PAID");
    const [rideDate, setRideDate] = useState("");
    const [notes, setNotes] = useState("");
    const [photo, setPhoto] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const resetForm = useCallback(() => {
        setSelectedPresetId(null);
        setShowCustomForm(false);
        setCustomValue("");
        setCustomLocation("");
        setRideDate("");
        setNotes("");
        setPhoto(null);
        onReset?.();
    }, [onReset]);

    const handlePresetSelect = useCallback((id: string, value: number, location?: string) => {
        setSelectedPresetId(id);
        setCustomValue(String(value));
        if (location) {
            setCustomLocation(location);
        }
        setShowCustomForm(false);
    }, []);

    const toggleCustomForm = useCallback(() => {
        setShowCustomForm((current) => {
            const next = !current;

            if (next) {
                setSelectedPresetId(null);
                setCustomValue("");
            }

            return next;
        });
    }, []);

    const handlePhotoChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result as string);
        };
        reader.readAsDataURL(file);
    }, []);

    return {
        fields: {
            selectedPresetId,
            customValue,
            customLocation,
            showCustomForm,
            paymentStatus,
            rideDate,
            notes,
            photo,
            isSaving,
        },
        setters: {
            setCustomValue,
            setCustomLocation,
            setPaymentStatus,
            setRideDate,
            setNotes,
            setIsSaving,
            setPhoto,
        },
        helpers: {
            resetForm,
            handlePresetSelect,
            toggleCustomForm,
            handlePhotoChange,
        },
    };
}
