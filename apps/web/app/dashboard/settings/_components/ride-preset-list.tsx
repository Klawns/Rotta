import { AnimatePresence } from "framer-motion";
import { Info } from "lucide-react";
import { RidePresetCard } from "./ride-preset-card";

interface RidePresetListProps {
    presets: any[];
    isLoading: boolean;
    onEdit: (preset: any) => void;
    onDelete: (id: string) => void;
}

export function RidePresetList({ presets, isLoading, onEdit, onDelete }: RidePresetListProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[1, 2].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-2xl" />)}
            </div>
        );
    }

    if (presets.length === 0) {
        return (
            <div className="text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Info className="mx-auto text-slate-600 mb-2" />
                <p className="text-slate-500 italic text-sm">Nenhum atalhos configurado. Crie o primeiro acima!</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
    );
}
