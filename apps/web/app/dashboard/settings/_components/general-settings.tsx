"use client";

import { useState } from "react";
import { LayoutGrid, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useRidePresets } from "../_hooks/use-ride-presets";
import { RidePresetForm } from "./ride-preset-form";
import { RidePresetList } from "./ride-preset-list";
import { EditRidePresetModal } from "./edit-ride-preset-modal";
import { SettingsTip } from "./settings-tip";
import { Button } from "@/components/ui/button";

export function GeneralSettings() {
    const {
        presets,
        isLoading,
        isSaving,
        isUpdating,
        addPreset,
        deletePreset,
        updatePreset
    } = useRidePresets();

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<any>(null);

    const handleAddPreset = async (data: any) => {
        const success = await addPreset(data);
        if (success) {
            setIsFormVisible(false);
        }
        return success;
    };

    const handleOpenEdit = (preset: any) => {
        setEditingPreset(preset);
        setIsEditModalOpen(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h3 className="text-2xl font-display font-extrabold text-text-primary tracking-tight flex items-center gap-2">
                        <LayoutGrid size={22} className="text-primary" />
                        Gerenciar Atalhos
                    </h3>
                    <p className="text-sm text-text-muted font-medium">Configure as opções rápidas para o painel mobile.</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-card-background border border-border-subtle rounded-2xl shadow-inner">
                        <span className="text-[10px] font-display font-bold text-text-muted uppercase tracking-widest">Ativos:</span>
                        <span className="text-primary font-display font-extrabold text-base leading-none">{presets.length}</span>
                    </div>
                    
                    <Button
                        onClick={() => setIsFormVisible(!isFormVisible)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold px-6 h-12 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center gap-2 uppercase tracking-widest text-[10px]"
                    >
                        <Plus size={16} strokeWidth={3} />
                        Criar novo
                    </Button>
                </div>
            </div>

            <AnimatePresence>
                {isFormVisible && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <RidePresetForm onAdd={handleAddPreset} isSaving={isSaving} />
                    </motion.div>
                )}
            </AnimatePresence>

            <RidePresetList
                presets={presets}
                isLoading={isLoading}
                onEdit={handleOpenEdit}
                onDelete={deletePreset}
                onAdd={() => setIsFormVisible(true)}
            />

            <SettingsTip />

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
