'use client';

import { ArrowRight, Calendar, FileText, Info } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { MobilePdfExportPeriod } from '@/hooks/use-export-rides-pdf';

interface ExportPeriodOption {
  id: MobilePdfExportPeriod;
  label: string;
}

interface PDFExportViewProps {
  periods: readonly ExportPeriodOption[];
  isExporting: boolean;
  activePeriod: MobilePdfExportPeriod | null;
  onExport: (period: MobilePdfExportPeriod) => Promise<unknown>;
}

export function PDFExportView({
  periods,
  isExporting,
  activePeriod,
  onExport,
}: PDFExportViewProps) {
  return (
    <section className="bg-card-background border border-border-subtle p-5 rounded-3xl shadow-sm">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-display font-extrabold text-text-primary flex items-center gap-2">
          <FileText size={18} className="text-icon-warning" />
          Exportar Relatorios
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {periods.map((period) => (
          <button
            key={period.id}
            type="button"
            onClick={() => {
              void onExport(period.id);
            }}
            disabled={isExporting}
            aria-busy={isExporting && activePeriod === period.id}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/50 border border-border-subtle hover:bg-hover-accent active:scale-95 transition-all group disabled:cursor-wait disabled:opacity-60"
          >
            <Calendar
              size={18}
              className="text-text-muted group-hover:text-primary transition-colors"
            />
            <span className="text-[10px] font-display font-bold text-text-primary uppercase tracking-tight">
              {isExporting && activePeriod === period.id
                ? 'Gerando'
                : period.label}
            </span>
          </button>
        ))}
      </div>

      <div className="bg-icon-warning/5 border border-icon-warning/20 rounded-2xl p-4 flex items-start gap-3 mb-4">
        <Info size={16} className="text-icon-warning shrink-0 mt-0.5" />
        <p className="text-[11px] text-icon-warning font-semibold leading-relaxed">
          Para exportacoes detalhadas por cliente ou periodos customizados,
          acesse o painel financeiro.
        </p>
      </div>

      <div className="pt-4 border-t border-border-subtle text-center">
        <Button
          asChild
          className="w-full bg-muted hover:bg-hover-accent text-text-primary font-bold h-12 rounded-2xl text-[10px] gap-2 active:scale-95 transition-all shadow-sm border border-border-subtle uppercase tracking-widest"
        >
          <Link href="/dashboard/finance">
            Acessar Painel Financeiro{' '}
            <ArrowRight size={14} className="text-primary" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
