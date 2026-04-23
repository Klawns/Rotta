'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RidePreset, RidePresetFormInput } from '@/types/settings';
import { useRidePresets } from '../_hooks/use-ride-presets';
import { EditRidePresetModal } from './edit-ride-preset-modal';
import { RidePresetForm } from './ride-preset-form';
import { RidePresetList } from './ride-preset-list';

export function GeneralSettings() {
  const {
    presets,
    isLoading,
    isSaving,
    isUpdating,
    addPreset,
    deletePreset,
    updatePreset,
  } = useRidePresets();

  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<RidePreset | null>(null);

  const toggleFormVisibility = () => {
    setIsFormVisible((current) => !current);
  };

  const handleAddPreset = async (data: RidePresetFormInput) => {
    const success = await addPreset(data);

    if (success) {
      setIsFormVisible(false);
    }

    return success;
  };

  const handleOpenEdit = (preset: RidePreset) => {
    setEditingPreset(preset);
    setIsEditModalOpen(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pt-1"
    >
      <section className="rounded-[2rem] border border-border-subtle bg-background/80 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-display font-bold tracking-tight text-text-primary sm:text-xl">
              Novo atalho
            </h1>
            <p className="text-sm text-text-secondary">
              Preencha valor e local.
            </p>
          </div>

          <Button
            type="button"
            variant={isFormVisible ? 'outline' : 'default'}
            onClick={toggleFormVisibility}
            className="h-10 rounded-2xl px-4"
          >
            <Plus className="h-4 w-4" />
            {isFormVisible ? 'Fechar' : 'Novo'}
          </Button>
        </div>

        <AnimatePresence initial={false}>
          {isFormVisible ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4">
                <RidePresetForm
                  onAdd={handleAddPreset}
                  isSaving={isSaving}
                  onCancel={toggleFormVisibility}
                />
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>

      <RidePresetList
        presets={presets}
        isLoading={isLoading}
        onEdit={handleOpenEdit}
        onDelete={deletePreset}
      />

      <EditRidePresetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        preset={editingPreset}
        onUpdate={updatePreset}
        isUpdating={isUpdating}
      />
    </motion.div>
  );
}
