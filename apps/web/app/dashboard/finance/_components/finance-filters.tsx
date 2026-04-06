'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Search, User as UserIcon, X } from 'lucide-react';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { parseApiError } from '@/lib/api-error';
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
  const autocompleteStatusMessage = (() => {
    if (
      clientAutocomplete.hasSearchValue &&
      !clientAutocomplete.hasMinimumSearchLength
    ) {
      return `Digite ao menos ${clientAutocomplete.minimumSearchLength} letras para buscar clientes.`;
    }

    if (clientAutocomplete.isLoading) {
      return 'Buscando clientes...';
    }

    if (clientAutocomplete.isFetching && clientAutocomplete.isReady) {
      return 'Atualizando sugestoes...';
    }

    if (clientAutocomplete.hasEmptyResults) {
      return 'Nenhum cliente encontrado para a busca informada.';
    }

    return null;
  })();

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
        <Popover
          open={clientAutocomplete.isOpen}
          onOpenChange={clientAutocomplete.onOpenChange}
        >
          <PopoverAnchor asChild>
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <Input
                role="combobox"
                aria-expanded={clientAutocomplete.isOpen}
                aria-autocomplete="list"
                aria-busy={
                  clientAutocomplete.isLoading || clientAutocomplete.isFetching
                }
                autoComplete="off"
                value={clientAutocomplete.searchText}
                onChange={(event) =>
                  clientAutocomplete.setSearchText(event.target.value)
                }
                onFocus={clientAutocomplete.onFocus}
                placeholder="Busque cliente para ver resumo"
                className="h-11 rounded-xl border-border-subtle bg-card-background pl-10 pr-10 font-medium text-text-primary shadow-sm md:h-12"
              />
              {(clientAutocomplete.searchText ||
                clientAutocomplete.hasAppliedClient) && (
                <button
                  type="button"
                  onClick={clientAutocomplete.onClear}
                  className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary transition hover:bg-hover-accent hover:text-text-primary"
                  aria-label="Limpar cliente"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </PopoverAnchor>

          <PopoverContent
            align="start"
            sideOffset={8}
            onOpenAutoFocus={(event) => event.preventDefault()}
            className="w-[var(--radix-popover-trigger-width)] rounded-xl border border-border-subtle bg-card-background p-0 shadow-xl"
          >
            <div className="max-h-72 overflow-y-auto p-2">
              {clientAutocomplete.isLoading && (
                <div className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm font-medium text-text-secondary">
                  <Loader2 className="size-4 animate-spin" />
                  Buscando clientes...
                </div>
              )}

              {!clientAutocomplete.isLoading && clientAutocomplete.isError && (
                <div className="rounded-lg border border-border-destructive/20 bg-button-destructive-subtle px-3 py-3 text-sm text-icon-destructive">
                  <p>
                    {parseApiError(
                      clientAutocomplete.error,
                      'Nao foi possivel carregar os clientes.',
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      void clientAutocomplete.refetch();
                    }}
                    className="mt-2 font-bold uppercase tracking-widest underline underline-offset-4"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {!clientAutocomplete.isLoading &&
                !clientAutocomplete.isError &&
                clientAutocomplete.hasEmptyResults && (
                  <div className="rounded-lg px-3 py-3 text-sm font-medium text-text-secondary">
                    Nenhum cliente encontrado para a busca informada.
                  </div>
                )}

              {!clientAutocomplete.isLoading &&
                !clientAutocomplete.isError &&
                clientAutocomplete.suggestions.length > 0 && (
                  <div className="space-y-1">
                    {clientAutocomplete.suggestions.map((client) => (
                      <button
                        key={client.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => clientAutocomplete.onSelect(client)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-text-primary transition hover:bg-hover-accent"
                      >
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserIcon size={14} />
                        </span>
                        <span className="min-w-0 flex-1 truncate">
                          {client.name}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </div>

            {!clientAutocomplete.isLoading &&
              !clientAutocomplete.isError &&
              clientAutocomplete.meta?.hasMore && (
                <div className="border-t border-border-subtle px-3 py-2 text-xs font-medium text-text-secondary">
                  Mostrando {clientAutocomplete.meta.returned} clientes. Continue
                  digitando para refinar.
                </div>
              )}
          </PopoverContent>
        </Popover>

        {clientAutocomplete.hasAppliedClient &&
          clientAutocomplete.hasSearchValue &&
          clientAutocomplete.hasMinimumSearchLength && (
          <p className="mt-2 text-xs font-medium text-text-secondary">
            Filtro aplicado para {clientAutocomplete.appliedClientName}. Limpe a
            busca para voltar ao resumo geral.
          </p>
        )}

        {clientAutocomplete.hasSearchValue &&
          autocompleteStatusMessage &&
          !clientAutocomplete.isOpen && (
            <p className="mt-2 text-xs font-medium text-text-secondary">
              {autocompleteStatusMessage}
            </p>
          )}
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
