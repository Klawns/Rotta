"use client";

import { Plus } from "lucide-react";

interface RidesHeaderProps {
  onNewRide: () => void;
  totalCount: number;
  hasActiveFilters: boolean;
}

export function RidesHeader({
  onNewRide,
  totalCount,
  hasActiveFilters,
}: RidesHeaderProps) {
  const summary =
    totalCount === 0
      ? "Nenhuma corrida neste recorte."
      : `${totalCount} ${
          totalCount === 1 ? "corrida encontrada" : "corridas encontradas"
        }${hasActiveFilters ? " no recorte atual." : " no historico atual."}`;

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3 md:block">
          <div className="min-w-0">
            <h1 className="hidden text-[1.75rem] font-display font-extrabold tracking-tight text-text-primary md:block md:text-3xl">
              Historico de Corridas
            </h1>
            <p className="mt-1 hidden text-base text-text-secondary md:block">
              Veja todas as corridas registradas e acompanhe pendencias com mais rapidez.
            </p>
          </div>

          <button
            onClick={onNewRide}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-card-background px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary shadow-sm transition-colors hover:border-border hover:bg-hover-accent md:hidden"
          >
            <Plus size={16} strokeWidth={3} />
            Novo
          </button>
        </div>

        <p className="text-sm font-medium text-text-secondary/85 md:hidden">
          {summary}
        </p>

        <p className="hidden text-sm font-medium text-text-secondary/85 md:block">
          {summary}
        </p>
      </div>

      <button
        onClick={onNewRide}
        className="hidden items-center justify-center gap-2 rounded-2xl bg-button-primary px-5 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-button-primary-foreground shadow-lg shadow-button-shadow transition-all hover:bg-button-primary-hover active:scale-95 md:inline-flex"
      >
        <Plus size={18} strokeWidth={3} />
        Nova Corrida
      </button>
    </header>
  );
}
