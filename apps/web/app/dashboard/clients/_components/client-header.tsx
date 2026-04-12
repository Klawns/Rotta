import { Plus } from 'lucide-react';

interface ClientHeaderProps {
  onNewClient: () => void;
  totalCount: number;
  hasActiveSearch: boolean;
}

export function ClientHeader({
  onNewClient,
  totalCount,
  hasActiveSearch,
}: ClientHeaderProps) {
  const summary =
    totalCount === 0
      ? 'Nenhum cliente neste recorte.'
      : `${totalCount} ${
          totalCount === 1 ? 'cliente encontrado' : 'clientes encontrados'
        }${hasActiveSearch ? ' na busca atual.' : ' na sua base.'}`;

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3 md:block">
          <div className="min-w-0">
            <h1 className="text-[1.75rem] font-display font-extrabold tracking-tight text-text-primary md:text-3xl">
              Meus Clientes
            </h1>
            <p className="mt-1 hidden text-base text-text-secondary md:block">
              Consulte sua base com mais rapidez e abra os detalhes sem sair da pagina.
            </p>
          </div>

          <button
            onClick={onNewClient}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-card-background px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary shadow-sm transition-colors hover:border-border hover:bg-hover-accent md:hidden"
          >
            <Plus size={16} strokeWidth={3} />
            Novo
          </button>
        </div>

        <p className="text-sm font-medium text-text-secondary/85">{summary}</p>
      </div>

      <button
        onClick={onNewClient}
        className="hidden items-center justify-center gap-2 rounded-2xl bg-button-primary px-5 py-3.5 text-xs font-bold uppercase tracking-[0.18em] text-button-primary-foreground shadow-lg shadow-button-shadow transition-all hover:bg-button-primary-hover active:scale-95 md:inline-flex"
      >
        <Plus size={18} strokeWidth={3} />
        Novo Cliente
      </button>
    </header>
  );
}
