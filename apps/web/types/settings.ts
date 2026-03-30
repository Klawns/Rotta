export interface RidePreset {
  id: string;
  label: string;
  value: number;
  location: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RidePresetFormInput {
  value: string;
  location: string;
}

export interface CreateRidePresetInput {
  label: string;
  value: number;
  location: string;
}

export interface UpdateRidePresetInput {
  label?: string;
  value?: number;
  location?: string;
}
