import { motion } from "framer-motion";
import { MapPin, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RidePresetCardProps {
    preset: any;
    onEdit: (preset: any) => void;
    onDelete: (id: string) => void;
}

export function RidePresetCard({ preset, onEdit, onDelete }: RidePresetCardProps) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => onEdit(preset)}
            className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:bg-white/10 transition-all border-l-4 border-l-blue-500 cursor-pointer"
        >
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black text-white">{formatCurrency(preset.value)}</span>
                </div>
                <p className="text-xs text-slate-300 font-bold flex items-center gap-1 uppercase tracking-wider">
                    <MapPin size={12} className="text-blue-400" /> {preset.location}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    className="p-3 text-white bg-blue-600/20 hover:bg-blue-600/40 rounded-xl transition-all border border-blue-500/20"
                    title="Editar"
                >
                    <Pencil size={18} className="text-blue-400" />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(preset.id);
                    }}
                    className="p-3 text-white bg-red-600/20 hover:bg-red-600/40 rounded-xl transition-all border border-red-500/20"
                    title="Excluir"
                >
                    <Trash2 size={18} className="text-red-400" />
                </button>
            </div>
        </motion.div>
    );
}
