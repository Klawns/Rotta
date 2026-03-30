'use client';

import { User, X } from 'lucide-react';
import { type Client } from '@/types/rides';

interface ClientDetailsHeaderProps {
  client: Client;
  onClose: () => void;
}

export function ClientDetailsHeader({
  client,
  onClose,
}: ClientDetailsHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-4 bg-icon-info/10 rounded-2xl text-icon-info font-black shadow-inner border border-icon-info/10">
          <User size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight">{client.name}</h2>
          <p className="text-text-secondary text-sm font-medium">ID: {client.id.split("-")[0]}</p>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-secondary/10 rounded-xl text-text-secondary hover:text-text-primary transition-colors active:scale-95 border border-transparent hover:border-border-subtle"
      >
        <X size={24} />
      </button>
    </header>
  );
}
