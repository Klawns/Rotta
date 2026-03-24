import { api, apiClient } from "@/services/api";
import { Client } from "@/types/rides";

export const clientsService = {
    /**
     * Busca todos os clientes com paginação por cursor.
     */
    async getClients(params?: {
        limit?: number;
        cursor?: string;
        search?: string
    }, signal?: AbortSignal): Promise<{ data: Client[]; meta: { total: number; hasMore: boolean; nextCursor?: string } }> {
        return apiClient.getPaginated("/clients", { params, signal });
    },

    /**
     * Cria um novo cliente.
     */
    async createClient(name: string): Promise<Client> {
        return apiClient.post("/clients", { name });
    },

    /**
     * Busca o saldo de um cliente.
     */
    async getClientBalance(clientId: string, signal?: AbortSignal) {
        return apiClient.get(`/clients/${clientId}/balance`, { signal });
    },

    async getClientPayments(clientId: string, signal?: AbortSignal): Promise<any[]> {
        const data = await apiClient.get<any[]>(`/clients/${clientId}/payments`, { signal });
        return data || [];
    },

    async deleteClient(clientId: string): Promise<void> {
        return apiClient.delete(`/clients/${clientId}`);
    },

    async togglePin(clientId: string, isPinned: boolean): Promise<void> {
        return apiClient.patch(`/clients/${clientId}`, { isPinned: !isPinned });
    },

    async closeDebt(clientId: string): Promise<void> {
        return apiClient.post(`/clients/${clientId}/close-debt`);
    }
};

export default clientsService;
