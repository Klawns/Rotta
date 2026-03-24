import { api, apiClient } from "@/services/api";
import {
    Ride,
    CreateRideDTO,
    UpdateRideDTO,
    RideResponseDTO,
    RidesParams,
    FrequentClient
} from "@/types/rides";
import { RidesMapper } from "./rides-mapper";

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface InfiniteResponse<T> {
    items: T[];
    total: number;
    nextCursor?: string;
    hasMore: boolean;
}

/**
 * Service global de corridas.
 * Toda comunicação com a API de corridas passa por aqui.
 * Usa mappers para desacoplar DTOs da interface.
 */
export const ridesService = {
    /**
     * Busca todas as corridas com filtros e paginação.
     */
    async getRides(params: RidesParams, signal?: AbortSignal): Promise<{ data: Ride[]; meta: any }> {
        const response = await apiClient.getPaginated("/rides", { params, signal });
        const { data, meta } = response;

        return {
            data: RidesMapper.toDomainList(data || []),
            meta
        };
    },

    /**
     * Busca estatísticas de corridas de um período.
     */
    async getStats(params: {
        period: string;
        start?: string;
        end?: string;
        clientId?: string;
    }, signal?: AbortSignal): Promise<{ data: any; meta: any }> {
        const response = await apiClient.getPaginated("/rides/stats", { params, signal });
        const { data, meta } = response;
        
        // O interceptor do backend separa o array 'rides' no 'data' 
        // e coloca os campos de resumo (count, totalValue) no 'meta'.
        // Precisamos remontar o objeto para o formato esperado pelo hook.
        return {
            data: {
                count: meta?.count ?? 0,
                totalValue: meta?.totalValue ?? 0,
                rides: RidesMapper.toDomainList(Array.isArray(data) ? data : (data?.rides || []))
            },
            meta
        };
    },

    /**
     * Busca clientes frequentes (fixados).
     */
    async getFrequentClients(signal?: AbortSignal): Promise<FrequentClient[]> {
        return apiClient.get("/rides/frequent-clients", { signal });
    },

    /**
     * Cria uma nova corrida.
     */
    async createRide(ride: CreateRideDTO): Promise<Ride> {
        const data = await apiClient.post("/rides", ride);
        return RidesMapper.toDomain(data);
    },

    /**
     * Atualiza uma corrida existente.
     */
    async updateRide(id: string, ride: UpdateRideDTO): Promise<Ride> {
        const cleanedPayload = Object.fromEntries(
            Object.entries(ride).filter(([_, v]) => v !== undefined)
        );

        console.log(`[ridesService] PATCH /rides/${id} - Payload:`, cleanedPayload);

        const data = await apiClient.patch(`/rides/${id}`, cleanedPayload);
        return RidesMapper.toDomain(data);
    },

    /**
     * Atualiza apenas status ou status de pagamento.
     */
    async updateRideStatus(
        id: string,
        dataPayload: { status?: string; paymentStatus?: string }
    ): Promise<Ride> {
        const data = await apiClient.patch(`/rides/${id}/status`, dataPayload);
        return RidesMapper.toDomain(data);
    },

    /**
     * Remove uma corrida.
     */
    async deleteRide(id: string): Promise<void> {
        return apiClient.delete(`/rides/${id}`);
    },

    /**
     * Busca o total de corridas do usuário.
     */
    async getRidesCount(signal?: AbortSignal): Promise<{ count: number }> {
        return apiClient.get("/rides/count", { signal });
    },

    /**
     * Busca corridas de um cliente específico.
     */
    async getRidesByClient(clientId: string, params?: { limit?: number; cursor?: string }, signal?: AbortSignal): Promise<{ data: Ride[]; meta: any }> {
        const response = await apiClient.getPaginated(`/rides/client/${clientId}`, { params, signal });
        const { data, meta } = response;

        return {
            data: RidesMapper.toDomainList(data || []),
            meta
        };
    },

    /**
     * Busca presets de corrida salvos nas configurações.
     */
    async getRidePresets(signal?: AbortSignal) {
        return apiClient.get("/settings/ride-presets", { signal });
    },

    /**
     * Remove um preset de corrida.
     */
    async deleteRidePreset(presetId: string): Promise<void> {
        return apiClient.delete(`/settings/ride-presets/${presetId}`);
    },
};

export default ridesService;
