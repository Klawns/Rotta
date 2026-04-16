import type { RideViewModel } from '@/types/rides';

export const CLIENT_EXPORT_TYPES = ['all', 'pending', 'paid'] as const;

export type ClientExportType = (typeof CLIENT_EXPORT_TYPES)[number];

export interface ClientExportDateRange {
  start: string;
  end: string;
}

export interface ClientExportSummary {
  totalRides: number;
  pendingRides: number;
  totalValue: number;
  totalPaid: number;
  totalPending: number;
}

export interface ClientExportResult {
  type: ClientExportType;
  rides: RideViewModel[];
  summary: ClientExportSummary;
  dateRange?: ClientExportDateRange;
}

export const CLIENT_EXPORT_OPTIONS = [
  {
    value: 'all',
    label: 'Todas',
    description: 'Historico completo do cliente dentro do periodo selecionado.',
  },
  {
    value: 'pending',
    label: 'Pendentes',
    description: 'Somente corridas com pendencia em aberto no periodo.',
  },
  {
    value: 'paid',
    label: 'Pagas',
    description: 'Somente corridas pagas no periodo selecionado.',
  },
] as const satisfies ReadonlyArray<{
  value: ClientExportType;
  label: string;
  description: string;
}>;

export function getClientExportTypeLabel(type: ClientExportType) {
  return (
    CLIENT_EXPORT_OPTIONS.find((option) => option.value === type)?.label ?? 'Todas'
  );
}

export function isClientExportDateRangeRequired(type: ClientExportType) {
  return CLIENT_EXPORT_TYPES.includes(type);
}
