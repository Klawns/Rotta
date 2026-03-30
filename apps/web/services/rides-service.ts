import { ApiEnvelope, apiClient } from '@/services/api';
import {
  CreateRideDTO,
  CursorMeta,
  FrequentClient,
  Ride,
  RideResponseDTO,
  RidesParams,
  UpdateRideDTO,
} from '@/types/rides';
import { RidesMapper } from './rides-mapper';

export interface RideStatsResponse {
  count: number;
  totalValue: number;
  rides: Ride[];
}

interface RideStatsMeta extends Record<string, unknown> {
  count?: number;
  totalValue?: number;
}

interface FlatRideStatsPayload {
  count?: number;
  totalValue?: number;
  rides?: RideResponseDTO[];
}

export const ridesService = {
  async getRides(
    params: RidesParams,
    signal?: AbortSignal,
  ): Promise<ApiEnvelope<Ride[], CursorMeta>> {
    const response = await apiClient.getPaginated<RideResponseDTO[], CursorMeta>(
      '/rides',
      { params, signal },
    );

    return {
      data: RidesMapper.toDomainList(response.data || []),
      meta: response.meta,
    };
  },

  async getStats(
    params: {
      period: string;
      start?: string;
      end?: string;
      clientId?: string;
    },
    signal?: AbortSignal,
  ): Promise<ApiEnvelope<RideStatsResponse>> {
    const response = await apiClient.getPaginated<
      FlatRideStatsPayload | RideResponseDTO[],
      RideStatsMeta
    >('/rides/stats', { params, signal });

    const rawData = response.data;
    const rawRides = Array.isArray(rawData) ? rawData : rawData?.rides || [];
    const count = Array.isArray(rawData)
      ? Number(response.meta?.count ?? 0)
      : Number(rawData?.count ?? response.meta?.count ?? 0);
    const totalValue = Array.isArray(rawData)
      ? Number(response.meta?.totalValue ?? 0)
      : Number(rawData?.totalValue ?? response.meta?.totalValue ?? 0);

    return {
      data: {
        count,
        totalValue,
        rides: RidesMapper.toDomainList(rawRides),
      },
      meta: response.meta,
    };
  },

  async getFrequentClients(signal?: AbortSignal): Promise<FrequentClient[]> {
    return apiClient.get('/rides/frequent-clients', { signal });
  },

  async createRide(ride: CreateRideDTO): Promise<Ride> {
    const data = await apiClient.post<RideResponseDTO>('/rides', ride);
    return RidesMapper.toDomain(data);
  },

  async updateRide(id: string, ride: UpdateRideDTO): Promise<Ride> {
    const cleanedPayload = Object.fromEntries(
      Object.entries(ride).filter(([, value]) => value !== undefined),
    );

    const data = await apiClient.patch<RideResponseDTO>(
      `/rides/${id}`,
      cleanedPayload,
    );
    return RidesMapper.toDomain(data);
  },

  async updateRideStatus(
    id: string,
    dataPayload: { status?: string; paymentStatus?: string },
  ): Promise<Ride> {
    const data = await apiClient.patch<RideResponseDTO>(
      `/rides/${id}/status`,
      dataPayload,
    );
    return RidesMapper.toDomain(data);
  },

  async deleteRide(id: string): Promise<void> {
    return apiClient.delete(`/rides/${id}`);
  },

  async deleteAllRides(): Promise<void> {
    return apiClient.delete('/rides/all');
  },

  async getRidesCount(signal?: AbortSignal): Promise<{ count: number }> {
    return apiClient.get('/rides/count', { signal });
  },

  async getRidesByClient(
    clientId: string,
    params?: { limit?: number; cursor?: string },
    signal?: AbortSignal,
  ): Promise<ApiEnvelope<Ride[], CursorMeta>> {
    const response = await apiClient.getPaginated<RideResponseDTO[], CursorMeta>(
      `/rides/client/${clientId}`,
      { params, signal },
    );

    return {
      data: RidesMapper.toDomainList(response.data || []),
      meta: response.meta,
    };
  },
};

export default ridesService;
