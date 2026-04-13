'use client';

import { type RidePhotoState } from '@/lib/ride-photo';
import { toISOFromLocalInput } from '@/lib/date-utils';
import { uploadImage } from '@/lib/upload';
import { ridesService } from '@/services/rides-service';
import {
  type CreateRideDTO,
  type PaymentStatus,
  type RideViewModel,
  type RideStatus,
} from '@/types/rides';

export interface RideSubmissionDraft {
  selectedClientId: string;
  value: string;
  location: string;
  notes: string;
  photo: RidePhotoState;
  rideDate: string;
  paymentStatus: PaymentStatus;
  useBalance?: boolean;
}

async function resolveRidePhoto(
  photo: RidePhotoState,
): Promise<string | null | undefined> {
  switch (photo.kind) {
    case 'existing':
      return undefined;
    case 'new': {
      const uploadResult = await uploadImage(photo.file, 'rides');
      return uploadResult.key;
    }
    default:
      return null;
  }
}

function buildRidePayload(
  draft: RideSubmissionDraft,
  photo: string | null | undefined,
): CreateRideDTO {
  const payload: CreateRideDTO = {
    clientId: draft.selectedClientId,
    value: Number(draft.value),
    location: draft.location || '',
    notes: draft.notes || null,
    status: 'COMPLETED' as RideStatus,
    paymentStatus: draft.paymentStatus,
    rideDate: draft.rideDate ? toISOFromLocalInput(draft.rideDate) : null,
    useBalance: draft.useBalance,
  };

  if (photo !== undefined) {
    payload.photo = photo;
  }

  return payload;
}

function assertValidRidePayload(payload: CreateRideDTO) {
  if (!payload.clientId) {
    throw new Error('Selecione um cliente para registrar a corrida.');
  }

  if (!Number.isFinite(payload.value) || payload.value <= 0) {
    throw new Error('Informe um valor valido para a corrida.');
  }
}

export async function submitRideDraft(
  draft: RideSubmissionDraft,
  rideToEdit?: RideViewModel | null,
) {
  const photo = await resolveRidePhoto(draft.photo);
  const payload = buildRidePayload(draft, photo);

  assertValidRidePayload(payload);

  if (rideToEdit) {
    return ridesService.updateRide(rideToEdit.id, payload);
  }

  return ridesService.createRide(payload);
}
