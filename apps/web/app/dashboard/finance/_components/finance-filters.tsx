'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ClientAutocompleteField } from '@/components/ui/client-autocomplete-field';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { type FinanceClientAutocompleteState } from '../_hooks/use-finance-client-autocomplete';
import { PERIODS, type PeriodId } from '../_types';

interface FinanceFiltersProps {
  clientAutocomplete: FinanceClientAutocompleteState;
  selectedPeriod: PeriodId;
  setSelectedPeriod: (period: PeriodId) => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

export function FinanceFilters({
  clientAutocomplete,
  selectedPeriod,
  setSelectedPeriod,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
}: FinanceFiltersProps) {
  return (
    <div className="sticky top-3 z-20 flex flex-col items-stretch gap-3 rounded-[1.5rem] border border-border-subtle bg-background/85 p-2.5 shadow-lg backdrop-blur-xl md:flex-row md:items-center md:rounded-[2rem] md:p-3">
      <div className="flex w-full overflow-x-auto rounded-2xl border border-border-subtle bg-card-background p-1 shadow-inner md:w-auto no-scrollbar">
        {PERIODS.map((period) => (
          <button
            key={period.id}
            onClick={() => setSelectedPeriod(period.id as PeriodId)}
            className={cn(
              'whitespace-nowrap rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] transition-all',
              selectedPeriod === period.id
                ? `${period.color} text-white shadow-lg`
                : 'text-text-muted hover:bg-hover-accent hover:text-text-primary',
            )}
          >
            {period.label}
          </button>
        ))}
      </div>

      <div className="mx-2 hidden h-8 w-px bg-border-subtle md:block" />

      <div className="w-full md:w-74">
        <ClientAutocompleteField
          autocomplete={clientAutocomplete}
          placeholder="Busque cliente para ver resumo"
          appliedHint={
            <p className="mt-2 text-xs font-medium text-text-secondary">
              Filtro aplicado para {clientAutocomplete.appliedClientName}. Limpe a
              busca para voltar ao resumo geral.
            </p>
          }
        />
      </div>

      <AnimatePresence>
        {selectedPeriod === 'custom' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid w-full gap-3 sm:grid-cols-2 md:flex md:w-auto"
          >
            <Input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 w-full rounded-xl border-border-subtle bg-card-background font-bold text-text-primary shadow-sm md:h-12 md:w-40"
            />
            <Input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 w-full rounded-xl border-border-subtle bg-card-background font-bold text-text-primary shadow-sm md:h-12 md:w-40"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
