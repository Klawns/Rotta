"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { uploadImage } from "@/lib/upload";
import { useAuth } from "@/hooks/use-auth";
import { Client, RidePreset, PaymentStatus, RideStatus, RideModalProps } from "../types";

export function useRideForm({ isOpen, onClose, onSuccess, clientId, rideToEdit }: Partial<RideModalProps>) {
    const { verify, user } = useAuth();
    
    // Data states
    const [clients, setClients] = useState<Client[]>([]);
    const [presets, setPresets] = useState<RidePreset[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    
    // Form states
    const [selectedClientId, setSelectedClientId] = useState(clientId || "");
    const [value, setValue] = useState<string>("");
    const [location, setLocation] = useState("");
    const [notes, setNotes] = useState("");
    const [photo, setPhoto] = useState<string | null>(null);
    const [rideDate, setRideDate] = useState("");
    const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("PAID");
    const [status, setStatus] = useState<RideStatus>("COMPLETED");
    const [isCustomValue, setIsCustomValue] = useState(false);
    
    // UI Phase states
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Client creation states
    const [newClientName, setNewClientName] = useState("");
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [clientPage, setClientPage] = useState(0);
    const clientsPerPage = 12;

    const resetForm = useCallback(() => {
        if (!clientId) setSelectedClientId("");
        setValue("");
        setLocation("");
        setNotes("");
        setRideDate("");
        setIsCustomValue(false);
        setPhoto(null);
        setPaymentStatus("PAID");
        setStatus("COMPLETED");
        setCurrentStep(clientId ? 2 : 1);
    }, [clientId]);

    const loadInitialData = useCallback(async () => {
        if (!user) return;
        setIsLoadingData(true);
        try {
            const promises: Promise<any>[] = [];
            if (!clientId) promises.push(api.get("/clients"));
            promises.push(api.get("/settings/ride-presets"));

            const results = await Promise.all(promises);

            if (!clientId) {
                setClients(results[0].data.clients || []);
                setPresets(results[1].data || []);
            } else {
                setPresets(results[0].data || []);
            }
        } catch (err) {
            console.error("Erro ao carregar dados iniciais do modal", err);
        } finally {
            setIsLoadingData(false);
        }
    }, [clientId, user]);

    useEffect(() => {
        if (isOpen && user) {
            loadInitialData();

            if (rideToEdit) {
                setSelectedClientId(rideToEdit.clientId || rideToEdit.client?.id || "");
                setValue(rideToEdit.value.toString());
                setLocation(rideToEdit.location || "");
                setNotes(rideToEdit.notes || "");
                setRideDate(rideToEdit.rideDate ? rideToEdit.rideDate.substring(0, 16) : "");
                setPaymentStatus(rideToEdit.paymentStatus);
                setStatus(rideToEdit.status);
                setPhoto(rideToEdit.photo || null);
                setIsCustomValue(true);
                setCurrentStep(2);
            } else {
                resetForm();
            }
        }
    }, [isOpen, clientId, rideToEdit, user, loadInitialData, resetForm]);

    const handleCreateClient = async () => {
        if (!newClientName) return;
        setIsCreatingClient(true);
        try {
            const { data } = await api.post("/clients", { name: newClientName });
            setClients((prev) => [...prev, data]);
            setSelectedClientId(data.id);
            setNewClientName("");
            setIsCreatingClient(false);
            setCurrentStep(2);
        } catch (err) {
            alert("Erro ao cadastrar cliente. Tente novamente.");
            setIsCreatingClient(false);
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();

        if (!selectedClientId || !value) {
            alert("Erro: Informe o cliente e o valor da corrida.");
            return;
        }

        setIsSubmitting(true);
        try {
            let uploadedPhotoUrl = photo;

            if (photo && photo.startsWith('data:image')) {
                try {
                    const response = await fetch(photo);
                    const blob = await response.blob();
                    const file = new File([blob], "ride-photo.jpg", { type: blob.type });

                    const uploadRes = await uploadImage(file, 'rides');
                    uploadedPhotoUrl = uploadRes.url;
                } catch (uploadErr) {
                    console.error("Falha ao subir imagem para o R2, continuando sem foto...", uploadErr);
                    uploadedPhotoUrl = null;
                }
            }

            const payload = {
                clientId: selectedClientId,
                value: Number(value),
                location: location || "Não informada",
                notes: notes || null,
                photo: uploadedPhotoUrl || null,
                status,
                paymentStatus,
                rideDate: rideDate || null
            };

            if (rideToEdit) {
                await api.patch(`/rides/${rideToEdit.id}`, payload);
            } else {
                await api.post("/rides", payload);
            }

            await verify();

            if (!rideToEdit) resetForm();
            onSuccess?.();
            onClose?.();
        } catch (err) {
            alert(`Erro ao ${rideToEdit ? 'atualizar' : 'registrar'} corrida. Tente novamente.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handlePresetClick = (preset: RidePreset) => {
        setValue(preset.value.toString());
        setLocation(preset.location || "");
        setIsCustomValue(false);
    };

    const nextStep = () => {
        if (currentStep === 1 && !selectedClientId) return;
        if (currentStep === 2 && !value) return;
        setCurrentStep(prev => Math.min(prev + 1, 5));
    }

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return {
        // Data
        clients,
        presets,
        isLoadingData,
        
        // Form state
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
        status,
        setStatus,
        isCustomValue,
        setIsCustomValue,
        
        // UI Navigation
        currentStep,
        setCurrentStep,
        isSubmitting,
        nextStep,
        prevStep,
        
        // Client creation
        newClientName,
        setNewClientName,
        isCreatingClient,
        setIsCreatingClient,
        clientPage,
        setClientPage,
        clientsPerPage,
        
        // Handlers
        handleCreateClient,
        handlePhotoChange,
        handleSubmit,
        handlePresetClick,
        resetForm
    };
}
