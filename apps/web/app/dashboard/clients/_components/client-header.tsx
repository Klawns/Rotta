import { Plus } from 'lucide-react';

interface ClientHeaderProps {
  onNewClient: () => void;
}

export function ClientHeader({ onNewClient }: ClientHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3 md:block">
          <h1 className="hidden text-[1.75rem] font-display font-extrabold tracking-tight text-text-primary md:block md:text-3xl">
            Meus Clientes
          </h1>
        </div>
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
