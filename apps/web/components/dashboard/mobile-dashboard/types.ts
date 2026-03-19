import { Ride, Client as BaseClient } from "@/app/dashboard/rides/types";

export type { Ride };
export type Client = BaseClient;

export interface DashboardStats {
    count: number;
    totalValue: number;
    rides: Ride[];
}

export interface RidePreset {
    id: string;
    value: number;
    location: string;
}

export type PaymentStatus = 'PENDING' | 'PAID';
export type RideStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';

export interface MobileDashboardProps {
    onRideCreated: () => void;
}
