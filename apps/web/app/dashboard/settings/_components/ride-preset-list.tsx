import { AnimatePresence } from 'framer-motion';
import { LayoutGrid } from 'lucide-react';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { RidePreset } from '@/types/settings';
import { RidePresetCard } from './ride-preset-card';

interface RidePresetListProps {
  presets: RidePreset[];
  isLoading: boolean;
  onEdit: (preset: RidePreset) => void;
  onDelete: (id: string) => Promise<boolean>;
}

function RidePresetListSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-44 animate-pulse rounded-[1.5rem] border border-border-subtle bg-card/50"
        />
      ))}
    </div>
  );
}

export function RidePresetList({
  presets,
  isLoading,
  onEdit,
  onDelete,
}: RidePresetListProps) {
  return (
    <section className="rounded-[2rem] border border-border-subtle bg-background/80 p-4 shadow-sm sm:p-5">
      <div className="mb-5 border-b border-border-subtle/70 pb-4">
        <h2 className="text-lg font-display font-bold tracking-tight text-text-primary">
          Atalhos salvos
        </h2>
      </div>

      {isLoading ? <RidePresetListSkeleton /> : null}

      {!isLoading && presets.length === 0 ? (
        <Empty className="rounded-[1.75rem] border border-dashed border-border-subtle bg-card/40 px-6 py-16">
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="rounded-2xl bg-primary/10 text-primary"
            >
              <LayoutGrid />
            </EmptyMedia>
            <EmptyTitle>Nenhum atalho salvo</EmptyTitle>
            <EmptyDescription>Crie o primeiro no card acima.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}

      {!isLoading && presets.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {presets.map((preset) => (
              <RidePresetCard
                key={preset.id}
                preset={preset}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      ) : null}
    </section>
  );
}
