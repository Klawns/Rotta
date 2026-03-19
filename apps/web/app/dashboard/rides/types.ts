export interface Ride {
    id: string;
    clientId: string;
    value: number;
    notes?: string;
    status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    paymentStatus: 'PENDING' | 'PAID';
    rideDate?: string;
    createdAt: string;
    clientName?: string;
    client?: {
        name: string;
    };
    location?: string;
    photo?: string;
}

export interface Client {
    id: string;
    name: string;
}

export interface FrequentClient extends Client {
    isPinned: boolean;
}

export interface RidesFilterState {
    search: string;
    statusFilter: string;
    paymentFilter: string;
    clientFilter: string;
    startDate: string;
    endDate: string;
}
