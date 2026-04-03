import type {
  PaymentStatus,
  RideClientDTO,
  RideResponseDTO,
  RideStatus,
} from '@/types/rides';

const RIDE_STATUSES = new Set<string>(['PENDING', 'COMPLETED', 'CANCELLED']);
const PAYMENT_STATUSES = new Set<string>(['PENDING', 'PAID']);

interface ParsedRideStatsPayload {
  count: number;
  totalValue: number;
  rides: RideResponseDTO[];
}

interface RideStatsMeta extends Record<string, unknown> {
  count?: number;
  totalValue?: number;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}

function isRideStatus(value: unknown): value is RideStatus {
  return typeof value === 'string' && RIDE_STATUSES.has(value);
}

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return typeof value === 'string' && PAYMENT_STATUSES.has(value);
}

function isNullableString(value: unknown) {
  return typeof value === 'undefined' || value === null || typeof value === 'string';
}

function isNullableNumber(value: unknown) {
  return typeof value === 'undefined' || value === null || typeof value === 'number';
}

function isRideClientDTO(value: unknown): value is RideClientDTO {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string'
  );
}

function isRideResponseDTO(value: unknown): value is RideResponseDTO {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.value === 'number' &&
    isNullableString(value.notes) &&
    isRideStatus(value.status) &&
    isPaymentStatus(value.paymentStatus) &&
    typeof value.rideDate === 'string' &&
    typeof value.createdAt === 'string' &&
    isNullableNumber(value.paidWithBalance) &&
    isNullableNumber(value.debtValue) &&
    isNullableString(value.location) &&
    isNullableString(value.photo) &&
    (value.client === null || isRideClientDTO(value.client))
  );
}

function getNumberField(value: unknown, fieldName: string, context: string) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    throw new Error(`Invalid ${fieldName} in ${context}`);
  }

  return value;
}

function getOptionalNumberField(source: unknown, fieldName: string) {
  if (!isRecord(source)) {
    return undefined;
  }

  const value = source[fieldName];
  return typeof value === 'number' && !Number.isNaN(value) ? value : undefined;
}

export function parseRideResponseDTO(
  value: unknown,
  context: string,
): RideResponseDTO {
  if (!isRideResponseDTO(value)) {
    throw new Error(`Invalid ride payload in ${context}`);
  }

  return value;
}

export function parseRideResponseDTOList(
  value: unknown,
  context: string,
): RideResponseDTO[] {
  if (!Array.isArray(value) || !value.every(isRideResponseDTO)) {
    throw new Error(`Invalid ride list payload in ${context}`);
  }

  return value;
}

export function parseRideStatsPayload(
  data: unknown,
  meta: RideStatsMeta,
  context: string,
): ParsedRideStatsPayload {
  return {
    count: getNumberField(
      getOptionalNumberField(meta, 'count'),
      'count',
      `${context} metadata`,
    ),
    totalValue: getNumberField(
      getOptionalNumberField(meta, 'totalValue'),
      'totalValue',
      `${context} metadata`,
    ),
    rides: parseRideResponseDTOList(data, `${context} rides`),
  };
}
