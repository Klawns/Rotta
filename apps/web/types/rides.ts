// ===========================
// Status & Enums
// ===========================
export type RideStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID';

// ===========================
// Entities
// ===========================
export interface Client {
    id: string;
    name: string;
    isPinned?: boolean;
    balance?: number;
}

export interface ClientBalance {
    totalDebt: number;
    totalPaid: number;
    remainingBalance: number;
    pendingRides: number;
    unusedPayments: number;
    clientBalance: number;
}

export interface FrequentClient extends Client {
    isPinned: boolean;
}

export interface RidePreset {
    id: string;
    value: number;
    location?: string;
}

// ===========================
// Ride Response (API → Frontend)
// ===========================
export interface RideResponseDTO {
    id: string;
    value: number;
    notes?: string | null;
    status: RideStatus;
    paymentStatus: PaymentStatus;
    rideDate: string;
    createdAt: string;
    paidWithBalance?: number;
    debtValue?: number;
    location?: string | null;
    photo?: string | null;
    client: {
        id: string;
        name: string;
    } | null;
}

/**
 * Backwards-compat alias used by pages/hooks that still expect
 * `clientId`, `clientName` etc. on the ride object.
 * Will be phased out once all consumers move to RideResponseDTO.
 */
export interface Ride extends Partial<RideResponseDTO> {
    id: string;
    value: number;
    createdAt: string;
    clientId?: string;
    clientName?: string;
    paid?: boolean;
    status?: RideStatus;
    paymentStatus?: PaymentStatus;
    rideDate?: string;
}

// ===========================
// Ride Mutation Payloads (Frontend → API)
// ===========================
export interface CreateRideDTO {
    clientId: string;
    value: number;
    location: string;
    notes?: string | null;
    photo?: string | null;
    status: RideStatus;
    paymentStatus: PaymentStatus;
    rideDate?: string | null;
    useBalance?: boolean;
}

export type UpdateRideDTO = Partial<CreateRideDTO>;

// ===========================
// Filters & Pagination
// ===========================
export interface RidesFilterState {
    search: string;
    paymentFilter: string;
    clientFilter: string;
    startDate: string;
    endDate: string;
}

export interface RidesParams {
    limit: number;
    cursor?: string;
    status?: string;
    paymentStatus?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export interface InfinitePaginatedResponse<T> {
    items: T[];
    total: number;
    nextCursor?: string;
    hasMore: boolean;
}

// ===========================
// UI Props
// ===========================
export interface RideModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    clientId?: string;
    clientName?: string;
    rideToEdit?: Ride | null;
}

export interface RideFormData {
    selectedClientId: string;
    value: string;
    location: string;
    notes: string;
    photo: string | null;
    rideDate: string;
    paymentStatus: PaymentStatus;
    isCustomValue: boolean;
}
