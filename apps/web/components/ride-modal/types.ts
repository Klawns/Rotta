export interface Client {
    id: string;
    name: string;
    isPinned: boolean;
}

export interface RidePreset {
    id: string;
    value: number;
    location?: string;
}

export type PaymentStatus = 'PENDING' | 'PAID';
export type RideStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface RideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    clientId?: string;
    clientName?: string;
    rideToEdit?: any;
}

export interface RideFormData {
    selectedClientId: string;
    value: string;
    location: string;
    notes: string;
    photo: string | null;
    rideDate: string;
    paymentStatus: PaymentStatus;
    status: RideStatus;
    isCustomValue: boolean;
}
