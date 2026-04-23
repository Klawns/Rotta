import { motion } from 'framer-motion';
import { MapPin, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { RidePreset } from '@/types/settings';

interface RidePresetCardProps {
  preset: RidePreset;
  onEdit: (preset: RidePreset) => void;
  onDelete: (id: string) => Promise<boolean>;
}

export function RidePresetCard({
  preset,
  onEdit,
  onDelete,
}: RidePresetCardProps) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-[1.5rem] border border-border-subtle bg-card/60 p-5 shadow-sm transition-colors hover:bg-card"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70">
              Valor sugerido
            </p>
            <h3 className="text-3xl font-display font-bold tracking-tight text-text-primary">
              {formatCurrency(preset.value)}
            </h3>
          </div>

          <div className="space-y-2">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border-subtle bg-background/75 px-3 py-1.5 text-sm font-medium text-text-primary">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span className="truncate">{preset.location}</span>
            </div>

            <p className="text-sm leading-6 text-text-secondary">
              Preenche valor e local automaticamente no painel mobile.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1 rounded-2xl border border-border-subtle bg-background/70 p-1">
          <button
            type="button"
            onClick={() => onEdit(preset)}
            className="rounded-xl p-2.5 text-text-secondary transition-colors hover:bg-primary/10 hover:text-primary"
            title="Editar atalho"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => void onDelete(preset.id)}
            className="rounded-xl p-2.5 text-text-secondary transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Excluir atalho"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
