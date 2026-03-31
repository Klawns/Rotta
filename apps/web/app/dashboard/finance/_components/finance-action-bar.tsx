import { Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { getPeriodAccent } from '../_lib/finance-theme';
import type { Period } from '../_types';

interface FinanceActionBarProps {
  currentPeriod: Period;
  isLoading: boolean;
  hasData: boolean;
  onExport: () => void;
  onExportCSV: () => void;
}

export function FinanceActionBar({
  currentPeriod,
  isLoading,
  hasData,
  onExport,
  onExportCSV,
}: FinanceActionBarProps) {
  const accent = getPeriodAccent(currentPeriod.id);
  const isDisabled = isLoading || !hasData;

  return (
    <section className="rounded-[1.75rem] border border-border-subtle bg-card-background p-4 shadow-sm md:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-text-muted">
            Exportar
          </p>
          <span className="text-xs font-medium text-text-muted">
            PDF ou planilha
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            onClick={onExport}
            disabled={isDisabled}
            className={cn(
              'h-12 w-full rounded-2xl px-5 font-bold',
              accent.badge,
              isDisabled && 'opacity-50',
            )}
          >
            <Download className="mr-2 size-4" />
            Exportar PDF
          </Button>

          <Button
            onClick={onExportCSV}
            disabled={isDisabled}
            variant="outline"
            className="h-12 w-full rounded-2xl border-border-subtle bg-background px-5 font-bold text-text-primary"
          >
            <FileSpreadsheet className="mr-2 size-4 text-primary" />
            Exportar planilha
          </Button>
        </div>
      </div>
    </section>
  );
}
