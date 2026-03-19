import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditRidePresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    preset: any;
    onUpdate: (id: string, data: { value: number; location: string }) => Promise<boolean>;
    isUpdating: boolean;
}

export function EditRidePresetModal({
    isOpen,
    onClose,
    preset,
    onUpdate,
    isUpdating
}: EditRidePresetModalProps) {
    const [editValue, setEditValue] = useState("");
    const [editLocation, setEditLocation] = useState("");

    useEffect(() => {
        if (preset) {
            setEditValue(preset.value.toString());
            setEditLocation(preset.location);
        }
    }, [preset]);

    const handleSave = async () => {
        if (!preset) return;
        const success = await onUpdate(preset.id, {
            value: Number(editValue),
            location: editLocation
        });
        if (success) {
            onClose();
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem] w-[95%] max-w-sm mx-auto p-8">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
                        <Pencil size={20} className="text-blue-400" />
                        Editar Atalho
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-6 border-y border-white/5 my-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Valor Sugerido (R$)</Label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">R$</span>
                            <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 h-12 pl-12 rounded-xl focus:ring-blue-500 font-bold text-white text-sm outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Localidade Padrão</Label>
                        <Input
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            className="bg-slate-950 border-white/10 h-12 rounded-xl focus:ring-blue-500"
                            placeholder="Ex: Centro, Bairro..."
                        />
                    </div>
                </div>

                <DialogFooter className="flex-row gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        className="flex-1 h-12 rounded-xl text-slate-500 font-bold hover:bg-white/5"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isUpdating}
                        className="flex-1 h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20"
                    >
                        {isUpdating ? "Salvando..." : "Salvar Alterações"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
