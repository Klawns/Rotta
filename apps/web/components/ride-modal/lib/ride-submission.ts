'use client';

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
  photo: string | null;
  rideDate: string;
  paymentStatus: PaymentStatus;
  useBalance?: boolean;
}

interface ResolvedRidePhoto {
  photo: string | null;
  continuedWithoutPhoto: boolean;
}

async function resolveRidePhoto(photo: string | null): Promise<ResolvedRidePhoto> {
  if (!photo || !photo.startsWith('data:image')) {
    return {
      photo,
      continuedWithoutPhoto: false,
    };
  }

  try {
    const response = await fetch(photo);
    const blob = await response.blob();
    const file = new File([blob], 'ride-photo.jpg', { type: blob.type });
    const uploadResult = await uploadImage(file, 'rides');

    return {
      photo: uploadResult.url,
      continuedWithoutPhoto: false,
    };
  } catch {
    return {
      photo: null,
      continuedWithoutPhoto: true,
    };
  }
}

function buildRidePayload(
  draft: RideSubmissionDraft,
  photo: string | null,
): CreateRideDTO {
  return {
    clientId: draft.selectedClientId,
    value: Number(draft.value),
    location: draft.location || '',
    notes: draft.notes || null,
    photo,
    status: 'COMPLETED' as RideStatus,
    paymentStatus: draft.paymentStatus,
    rideDate: draft.rideDate ? toISOFromLocalInput(draft.rideDate) : null,
    useBalance: draft.useBalance,
  };
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
  const { photo, continuedWithoutPhoto } = await resolveRidePhoto(draft.photo);
  const payload = buildRidePayload(
    draft,
    continuedWithoutPhoto ? null : photo || null,
  );

  assertValidRidePayload(payload);

  if (rideToEdit) {
    return ridesService.updateRide(rideToEdit.id, payload);
  }

  return ridesService.createRide(payload);
}
