'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CalendarRange, Search, SlidersHorizontal, X } from 'lucide-react';
import { ClientAutocompleteField } from '@/components/ui/client-autocomplete-field';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  RIDE_PAYMENT_FILTER_OPTIONS,
  RIDE_PERIOD_PRESET_OPTIONS,
  type RidesFilterChip,
} from '../_lib/rides-filters';
import { type ClientAutocompleteState } from '@/hooks/use-client-autocomplete';
import {
  type RidePaymentFilter,
  type RidePeriodPreset,
  type RidesFilterState,
} from '@/types/rides';

interface RidesFiltersProps {
  filters: RidesFilterState;
  clientAutocomplete: ClientAutocompleteState;
  activeFilterChips: RidesFilterChip[];
  activeFilterCount: number;
  setSearch: (value: string) => void;
  setPaymentFilter: (value: RidePaymentFilter) => void;
  setStartDate: (value: string) => void;
  setEndDate: (value: string) => void;
  setPeriodPreset: (value: RidePeriodPreset) => void;
  isFiltersOpen: boolean;
  setIsFiltersOpen: (value: boolean) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function RidesFilters({
  filters,
  clientAutocomplete,
  activeFilterChips,
  activeFilterCount,
  setSearch,
  setPaymentFilter,
  setStartDate,
  setEndDate,
  setPeriodPreset,
  isFiltersOpen,
  setIsFiltersOpen,
  hasActiveFilters,
  onClearFilters,
}: RidesFiltersProps) {
  const hiddenMobileChips = activeFilterChips.filter(
    (chip) => chip.id !== 'search' && chip.id !== 'payment',
  );
  const mobileFilterSummary =
    hiddenMobileChips.length === 1
      ? hiddenMobileChips[0].label
      : hiddenMobileChips.length > 1
        ? `${hiddenMobileChips.length} filtros adicionais ativos`
        : filters.search.trim()
          ? 'Busca ativa'
          : null;

  return (
    <div className="space-y-4">
      <section className="rounded-[1.5rem] border border-border-subtle bg-background/90 p-3 shadow-sm backdrop-blur-sm md:hidden">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <Input
                type="text"
                placeholder="Buscar por cliente, local ou ID"
                value={filters.search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 rounded-2xl border-border-subtle bg-card-background pl-11 pr-4 text-sm font-medium text-text-primary shadow-none"
              />
            </div>

            <button
              type="button"
              onClick={() => setIsFiltersOpen(true)}
              className={cn(
                'inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border px-4 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors',
                isFiltersOpen
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border-subtle bg-card-background text-text-secondary hover:border-border hover:bg-hover-accent hover:text-text-primary',
              )}
            >
              <SlidersHorizontal size={16} />
              Filtros
              {activeFilterCount > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                  {activeFilterCount}
                </span>
              ) : null}
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {RIDE_PAYMENT_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentFilter(option.value)}
                className={cn(
                  'shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
                  filters.paymentFilter === option.value
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-subtle bg-card-background text-text-secondary hover:border-border hover:bg-hover-accent hover:text-text-primary',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {mobileFilterSummary ? (
            <div className="flex items-center justify-between gap-3">
              <p className="truncate text-xs font-medium text-text-secondary">
                {mobileFilterSummary}
              </p>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="shrink-0 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary"
                >
                  Limpar
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="hidden rounded-[1.9rem] border border-border-subtle bg-background/90 p-4 shadow-sm backdrop-blur-sm md:block">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
              />
              <Input
                type="text"
                placeholder="Buscar por cliente, local ou ID da corrida"
                value={filters.search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-12 rounded-2xl border-border-subtle bg-card-background pl-11 pr-4 text-sm font-medium text-text-primary shadow-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className={cn(
                  'inline-flex h-12 items-center gap-2 rounded-2xl border px-4 text-[11px] font-bold uppercase tracking-[0.18em] transition-colors',
                  isFiltersOpen
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border-subtle bg-card-background text-text-secondary hover:border-border hover:bg-hover-accent hover:text-text-primary',
                )}
              >
                <SlidersHorizontal size={16} />
                Filtros
                {activeFilterCount > 0 ? (
                  <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                    {activeFilterCount}
                  </span>
                ) : null}
              </button>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={onClearFilters}
                  className="inline-flex h-12 items-center gap-2 rounded-2xl px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-hover-accent hover:text-text-primary"
                >
                  <X size={14} />
                  Limpar
                </button>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {RIDE_PAYMENT_FILTER_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentFilter(option.value)}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors',
                  filters.paymentFilter === option.value
                    ? 'border-primary bg-primary text-white'
                    : 'border-border-subtle bg-card-background text-text-secondary hover:border-border hover:bg-hover-accent hover:text-text-primary',
                )}
              >
                {option.label}
              </button>
            ))}
          </div>

          {activeFilterChips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip.id}
                  className="inline-flex max-w-full items-center truncate rounded-full border border-border-subtle bg-card-background px-3 py-1.5 text-xs font-medium text-text-secondary"
                >
                  {chip.label}
                </span>
              ))}
            </div>
          ) : null}

          <AnimatePresence initial={false}>
            {isFiltersOpen ? (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                className="overflow-hidden"
              >
                <div className="grid gap-5 border-t border-border-subtle/70 pt-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                        Cliente
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        Selecione um cliente especifico quando quiser reduzir a lista.
                      </p>
                    </div>

                    <ClientAutocompleteField
                      autocomplete={clientAutocomplete}
                      placeholder="Buscar cliente por nome"
                      inputClassName="h-12 rounded-2xl border-border-subtle bg-card-background shadow-none"
                      appliedHint={
                        <p className="mt-2 text-xs text-text-secondary">
                          Filtro aplicado para {clientAutocomplete.appliedClientName}.
                        </p>
                      }
                    />
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <CalendarRange size={16} className="text-text-secondary" />
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                          Periodo
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-text-secondary">
                        Use atalhos rapidos ou ajuste um intervalo manual.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {RIDE_PERIOD_PRESET_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPeriodPreset(option.value)}
                          className={cn(
                            'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                            filters.periodPreset === option.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border-subtle bg-card-background text-text-secondary hover:border-border hover:bg-hover-accent hover:text-text-primary',
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                          Inicio
                        </label>
                        <Input
                          type="date"
                          value={filters.startDate}
                          onChange={(event) => setStartDate(event.target.value)}
                          className="h-12 rounded-2xl border-border-subtle bg-card-background text-text-primary shadow-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                          Fim
                        </label>
                        <Input
                          type="date"
                          value={filters.endDate}
                          onChange={(event) => setEndDate(event.target.value)}
                          className="h-12 rounded-2xl border-border-subtle bg-card-background text-text-primary shadow-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      <Drawer open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
        <DrawerContent className="rounded-t-[2rem] border-border-subtle bg-background md:hidden">
          <DrawerHeader className="px-4 pt-5 text-left">
            <DrawerTitle className="text-lg font-display font-extrabold text-text-primary">
              Ajustar filtros
            </DrawerTitle>
            <DrawerDescription>
              Refine cliente e periodo sem ocupar o topo da lista.
            </DrawerDescription>
          </DrawerHeader>

          <div className="space-y-5 overflow-y-auto px-4 pb-2">
            <section className="space-y-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                  Cliente
                </p>
                <p className="mt-1 text-sm text-text-secondary">
                  Selecione um cliente especifico quando quiser reduzir a lista.
                </p>
              </div>

              <ClientAutocompleteField
                autocomplete={clientAutocomplete}
                placeholder="Buscar cliente por nome"
                inputClassName="h-11 rounded-2xl border-border-subtle bg-card-background shadow-none"
                appliedHint={
                  <p className="mt-2 text-xs text-text-secondary">
                    Filtro aplicado para {clientAutocomplete.appliedClientName}.
                  </p>
                }
              />
            </section>

            <section className="space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <CalendarRange size={16} className="text-text-secondary" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-muted">
                    Periodo
                  </p>
                </div>
                <p className="mt-1 text-sm text-text-secondary">
                  Use atalhos rapidos ou ajuste um intervalo manual.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {RIDE_PERIOD_PRESET_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPeriodPreset(option.value)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                      filters.periodPreset === option.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border-subtle bg-card-background text-text-secondary hover:border-border hover:bg-hover-accent hover:text-text-primary',
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                    Inicio
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="h-11 rounded-2xl border-border-subtle bg-card-background text-text-primary shadow-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
                    Fim
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="h-11 rounded-2xl border-border-subtle bg-card-background text-text-primary shadow-none"
                  />
                </div>
              </div>
            </section>
          </div>

          <DrawerFooter className="px-4 pb-4">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onClearFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-card-background px-4 text-sm font-semibold text-text-secondary transition-colors hover:border-border hover:bg-hover-accent hover:text-text-primary"
              >
                <X size={14} />
                Limpar filtros
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => setIsFiltersOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-2xl bg-button-primary px-4 text-sm font-semibold text-button-primary-foreground transition-colors hover:bg-button-primary-hover"
            >
              Fechar
            </button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
