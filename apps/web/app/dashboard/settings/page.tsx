"use client";

import { useState } from "react";
import { DollarSign } from "lucide-react";
import { useRidePresets } from "./_hooks/use-ride-presets";
import { SettingsHeader } from "./_components/header";
import { RidePresetForm } from "./_components/ride-preset-form";
import { RidePresetList } from "./_components/ride-preset-list";
import { EditRidePresetModal } from "./_components/edit-ride-preset-modal";
import { SettingsTip } from "./_components/settings-tip";

export default function SettingsPage() {
    const {
        presets,
        isLoading,
        isSaving,
        isUpdating,
        addPreset,
        deletePreset,
        updatePreset
    } = useRidePresets();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingPreset, setEditingPreset] = useState<any>(null);

    const handleOpenEdit = (preset: any) => {
        setEditingPreset(preset);
        setIsEditModalOpen(true);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <SettingsHeader />

            <section className="glass-card p-8 rounded-[2.5rem] border border-white/5 bg-slate-900/40 space-y-8">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <DollarSign size={20} className="text-blue-400" />
                        Atalhos de Corrida
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Estes botões aparecerão na sua tela principal no celular para registros rápidos.
                    </p>
                </div>

                <RidePresetForm onAdd={addPreset} isSaving={isSaving} />

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        Seus Atalhos Ativos
                        <span className="bg-blue-600/20 text-blue-400 text-[10px] px-2 py-0.5 rounded-full">
                            {presets.length}
                        </span>
                    </h3>

                    <RidePresetList
                        presets={presets}
                        isLoading={isLoading}
                        onEdit={handleOpenEdit}
                        onDelete={deletePreset}
                    />
                </div>
            </section>

            <SettingsTip />

            <EditRidePresetModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                preset={editingPreset}
                onUpdate={updatePreset}
                isUpdating={isUpdating}
            />
        </div>
    );
}
