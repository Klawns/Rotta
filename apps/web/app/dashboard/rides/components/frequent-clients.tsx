"use client";

import { useState } from "react";
import { ChevronDown, Star, User } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { FrequentClient } from "@/types/rides";
import { cn } from "@/lib/utils";

interface FrequentClientsProps {
  clients: FrequentClient[];
  isLoading: boolean;
  onSelectClient: (id: string, name: string) => void;
  className?: string;
}

export function FrequentClients({
  clients,
  isLoading,
  onSelectClient,
  className,
}: FrequentClientsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading || clients.length === 0) {
    return null;
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "rounded-[1.75rem] border border-border-subtle bg-background/80 p-4 shadow-sm",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
              Atalhos
            </p>
            <div className="flex items-center gap-2">
              <Star className="size-4 text-primary" />
              <p className="text-sm font-semibold text-text-primary">
                Clientes fixados para nova corrida
              </p>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle px-3 py-1.5 text-xs font-semibold text-text-secondary transition-colors hover:border-border hover:bg-hover-accent hover:text-text-primary"
            >
              {isOpen ? "Ocultar" : "Mostrar"}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="flex flex-wrap gap-2.5 border-t border-border-subtle/70 pt-4">
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => onSelectClient(client.id, client.name)}
                className="inline-flex min-w-0 items-center gap-2.5 rounded-full border border-border-subtle bg-card-background px-3.5 py-2 text-left text-sm font-medium text-text-primary transition-colors hover:border-border hover:bg-hover-accent"
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User size={14} />
                </span>
                <span className="truncate">{client.name}</span>
              </button>
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
