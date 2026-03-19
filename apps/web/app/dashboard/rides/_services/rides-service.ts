import { api } from "@/services/api";
import { Ride, Client, FrequentClient } from "../types";

export interface RidesParams {
    limit: number;
    offset: number;
    status?: string;
    paymentStatus?: string;
    clientId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export const ridesService = {
    getRides: async (params: RidesParams) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                queryParams.append(key, value.toString());
            }
        });
        return api.get(`/rides?${queryParams.toString()}`);
    },

    getFrequentClients: async (): Promise<{ data: FrequentClient[] }> => {
        return api.get("/rides/frequent-clients");
    },

    deleteRide: async (id: string) => {
        return api.delete(`/rides/${id}`);
    },

    updatePaymentStatus: async (id: string, paymentStatus: 'PAID' | 'PENDING') => {
        return api.patch(`/rides/${id}/status`, { paymentStatus });
    }
};
