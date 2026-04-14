'use client';

import { Plus, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ClientSearchProps {
  value: string;
  onChange: (value: string) => void;
  onNewClient?: () => void;
}

export function ClientSearch({
  value,
  onChange,
  onNewClient,
}: ClientSearchProps) {
  return (
    <section className="rounded-[1.5rem] border border-border-subtle bg-background/90 p-3 shadow-sm backdrop-blur-sm md:rounded-[1.9rem] md:p-4">
      <div className="flex items-center gap-3">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
          />

          <Input
            type="text"
            placeholder="Buscar por nome do cliente"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 rounded-2xl border-border-subtle bg-card-background pl-11 pr-12 text-sm font-medium text-text-primary shadow-none md:h-12"
          />

          {value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover-accent hover:text-text-primary"
              aria-label="Limpar busca"
            >
              <X size={16} />
            </button>
          ) : null}
        </div>

        {onNewClient ? (
          <button
            type="button"
            onClick={onNewClient}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-border-subtle bg-card-background px-4 text-[11px] font-bold uppercase tracking-[0.18em] text-text-primary shadow-sm transition-colors hover:border-border hover:bg-hover-accent md:hidden"
          >
            <Plus size={16} strokeWidth={3} />
            Novo
          </button>
        ) : null}
      </div>
    </section>
  );
}
