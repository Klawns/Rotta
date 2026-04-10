'use client';

import { useExportRidesPdf } from '@/hooks/use-export-rides-pdf';
import { PDFExportView } from './pdf-export-view';

interface PDFExportProps {
  userName: string;
}

const EXPORT_PERIODS = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
] as const;

export function PDFExport({ userName }: PDFExportProps) {
  const exportPdf = useExportRidesPdf({ userName });

  return (
    <PDFExportView
      periods={EXPORT_PERIODS}
      isExporting={exportPdf.isExporting}
      activePeriod={exportPdf.activePeriod}
      onExport={exportPdf.exportPeriod}
    />
  );
}
