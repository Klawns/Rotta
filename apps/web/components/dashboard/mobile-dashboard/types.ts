import { type RideViewModel } from "@/types/rides";
import type { FreeTrialState } from "@/services/free-trial-service";
export type { RideViewModel };
export type { Client, RidePreset, PaymentStatus, RideStatus } from "@/types/rides";

export interface DashboardStats {
    count: number;
    totalValue: number;
    rides: RideViewModel[];
}

export interface MobileDashboardProps {
    onRideCreated: () => void | Promise<void>;
    trial: FreeTrialState;
}
