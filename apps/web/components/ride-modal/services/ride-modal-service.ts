import { clientsService } from '@/services/clients-service';
import { ridesService } from '@/services/rides-service';
import { settingsService } from '@/services/settings-service';
import {
  Client,
  CreateRideDTO,
  Ride,
  RidePreset,
  UpdateRideDTO,
} from '@/types/rides';

export const rideModalService = {
  async getClients(): Promise<{ clients: Client[] }> {
    const response = await clientsService.getClients();
    return { clients: response.data || [] };
  },

  async getRidePresets(): Promise<RidePreset[]> {
    return settingsService.getRidePresets();
  },

  async createClient(name: string): Promise<Client> {
    return clientsService.createClient({ name });
  },

  async createRide(payload: CreateRideDTO): Promise<Ride> {
    return ridesService.createRide(payload);
  },

  async updateRide(id: string, payload: UpdateRideDTO): Promise<Ride> {
    return ridesService.updateRide(id, payload);
  },

  async getClientBalance(clientId: string): Promise<{ clientBalance: number }> {
    return clientsService.getClientBalance(clientId);
  },
};
