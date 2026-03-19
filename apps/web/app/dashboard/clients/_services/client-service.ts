import { api } from "@/services/api";

export interface Client {
    id: string;
    name: string;
    userId: string;
    isPinned: boolean;
    createdAt: string;
}

export interface ClientBalance {
    totalDebt: number;
    totalPaid: number;
    remainingBalance: number;
}

export interface FetchClientsParams {
    limit: number;
    offset: number;
    search?: string;
}

export interface FetchClientsResponse {
    clients: Client[];
    total: number;
}

export const clientService = {
    async fetchClients(params: FetchClientsParams): Promise<FetchClientsResponse> {
        const queryParams = new URLSearchParams();
        queryParams.append("limit", params.limit.toString());
        queryParams.append("offset", params.offset.toString());
        if (params.search) queryParams.append("search", params.search);

        const { data } = await api.get(`/clients?${queryParams.toString()}`);
        return {
            clients: data.clients || [],
            total: data.total || 0,
        };
    },

    async fetchClientBalance(clientId: string): Promise<ClientBalance> {
        const { data } = await api.get(`/clients/${clientId}/balance`);
        return data;
    },

    async fetchClientPayments(clientId: string): Promise<any[]> {
        const { data } = await api.get(`/clients/${clientId}/payments`);
        return data || [];
    },

    async deleteClient(clientId: string): Promise<void> {
        await api.delete(`/clients/${clientId}`);
    },

    async togglePin(clientId: string, isPinned: boolean): Promise<void> {
        await api.patch(`/clients/${clientId}`, { isPinned: !isPinned });
    },

    async closeDebt(clientId: string): Promise<void> {
        await api.post(`/clients/${clientId}/close-debt`);
    }
};
