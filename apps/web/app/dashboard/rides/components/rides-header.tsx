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
      ? "Nenhuma corrida encontrada no recorte atual."
      : `${totalCount} ${
          totalCount === 1 ? "corrida encontrada" : "corridas encontradas"
        }${hasActiveFilters ? " com os filtros atuais." : " no historico atual."}`;

  return (
    <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <div>
          <h1 className="text-3xl font-display font-extrabold tracking-tight text-text-primary">
            Historico de Corridas
          </h1>
          <p className="mt-1 text-base text-text-secondary">
            Veja todas as corridas registradas e acompanhe pendencias com mais rapidez.
          </p>
        </div>

        <p className="text-sm font-medium text-text-secondary/85">{summary}</p>
      </div>

      <button
        onClick={onNewRide}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-button-primary px-5 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-button-primary-foreground shadow-lg shadow-button-shadow transition-all hover:bg-button-primary-hover active:scale-95"
      >
        <Plus size={18} strokeWidth={3} />
        Nova Corrida
      </button>
    </header>
  );
}
