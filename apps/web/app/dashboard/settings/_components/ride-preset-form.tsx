import { type FormEvent, useState } from 'react';
import { CircleDollarSign, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RidePresetFormProps {
  onAdd: (preset: { value: string; location: string }) => Promise<boolean>;
  isSaving: boolean;
  onCancel?: () => void;
}

export function RidePresetForm({
  onAdd,
  isSaving,
  onCancel,
}: RidePresetFormProps) {
  const [newPreset, setNewPreset] = useState({
    value: '',
    location: '',
  });

  const isSubmitDisabled =
    isSaving ||
    newPreset.value.trim().length === 0 ||
    newPreset.location.trim().length === 0;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    const success = await onAdd({
      value: newPreset.value.trim(),
      location: newPreset.location.trim(),
    });

    if (success) {
      setNewPreset({ value: '', location: '' });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[1.5rem] border border-border-subtle bg-card/45 p-4 shadow-sm sm:p-5"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Plus className="h-4 w-4" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-display font-bold tracking-tight text-text-primary">
              Adicionar atalho
            </h3>
            <p className="text-sm text-text-secondary">
              Use um nome curto.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="ride-preset-value"
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70"
            >
              Valor
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
                <CircleDollarSign className="h-4 w-4" />
              </div>
              <Input
                id="ride-preset-value"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newPreset.value}
                disabled={isSaving}
                onChange={(event) =>
                  setNewPreset((current) => ({
                    ...current,
                    value: event.target.value,
                  }))
                }
                className="h-14 rounded-2xl border-border-subtle bg-background pl-14 text-base font-semibold text-text-primary"
              />
            </div>
            <p className="text-sm text-text-secondary">Valor da corrida.</p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="ride-preset-location"
              className="text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary/70"
            >
              Local
            </Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl border border-border-subtle bg-muted/40 text-text-secondary">
                <MapPin className="h-4 w-4" />
              </div>
              <Input
                id="ride-preset-location"
                type="text"
                placeholder="Ex: Centro, Hospital, Aeroporto"
                value={newPreset.location}
                disabled={isSaving}
                onChange={(event) =>
                  setNewPreset((current) => ({
                    ...current,
                    location: event.target.value,
                  }))
                }
                className="h-14 rounded-2xl border-border-subtle bg-background pl-14 text-base font-semibold text-text-primary"
              />
            </div>
            <p className="text-sm text-text-secondary">Nome exibido no atalho.</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-border-subtle/70 pt-5 sm:flex-row sm:justify-end">
          {onCancel ? (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="h-11 rounded-2xl px-5"
            >
              Cancelar
            </Button>
          ) : null}

          <Button
            type="submit"
            disabled={isSubmitDisabled}
            className="h-11 rounded-2xl px-5"
          >
            <Plus className="h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>
    </form>
  );
}
