import {
  type RideDomainModel,
  type RideResponseDTO,
  type RideViewModel,
} from '@/types/rides';

function normalizeOptionalNumber(value: number | null | undefined) {
  return typeof value === 'number' ? value : undefined;
}

function normalizeNullableString(value: string | null | undefined) {
  return typeof value === 'string' ? value : null;
}

function resolveClientName(ride: Pick<RideDomainModel, 'client'>) {
  return ride.client?.name || 'Sem nome';
}

export class RidesMapper {
  static toDomain(dto: RideResponseDTO): RideDomainModel {
    return {
      id: dto.id,
      value: dto.value,
      notes: normalizeNullableString(dto.notes),
      status: dto.status,
      paymentStatus: dto.paymentStatus,
      rideDate: dto.rideDate,
      createdAt: dto.createdAt,
      paidWithBalance: normalizeOptionalNumber(dto.paidWithBalance),
      debtValue: normalizeOptionalNumber(dto.debtValue),
      location: normalizeNullableString(dto.location),
      photo: normalizeNullableString(dto.photo),
      client: dto.client,
    };
  }

  static toViewModel(ride: RideDomainModel): RideViewModel {
    return {
      ...ride,
      clientId: ride.client?.id ?? null,
      clientName: resolveClientName(ride),
      paid: ride.paymentStatus === 'PAID',
    };
  }

  static toViewModelFromDTO(dto: RideResponseDTO): RideViewModel {
    return this.toViewModel(this.toDomain(dto));
  }

  static toViewModelList(dtos: RideResponseDTO[]): RideViewModel[] {
    return dtos.map((dto) => this.toViewModelFromDTO(dto));
  }
}
