import { useState } from "react";
import { DollarSign, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RidePresetFormProps {
    onAdd: (preset: { value: string; location: string }) => Promise<boolean>;
    isSaving: boolean;
}

export function RidePresetForm({ onAdd, isSaving }: RidePresetFormProps) {
    const [newPreset, setNewPreset] = useState({
        value: "",
        location: ""
    });

    const handleSubmit = async () => {
        const success = await onAdd(newPreset);
        if (success) {
            setNewPreset({ value: "", location: "" });
        }
    };

    return (
        <div className="bg-white/5 rounded-3xl p-6 border border-white/5 space-y-4">
            <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Criar Novo Atalho</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold ml-1">VALOR (R$)</label>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-3 top-3 text-slate-500" />
                        <input
                            type="number"
                            placeholder="0.00"
                            value={newPreset.value}
                            onChange={e => setNewPreset(prev => ({ ...prev, value: e.target.value }))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs text-slate-500 font-bold ml-1">LOCALIDADE (DESCRIÇÃO DO BOTÃO)</label>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Ex: Centro"
                            value={newPreset.location}
                            onChange={e => setNewPreset(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:border-blue-500 outline-none transition-all"
                        />
                    </div>
                </div>
            </div>
            <Button
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl mt-2 shadow-lg shadow-blue-600/20"
            >
                {isSaving ? "Adicionando..." : "Adicionar Atalho à Grid"}
            </Button>
        </div>
    );
}
