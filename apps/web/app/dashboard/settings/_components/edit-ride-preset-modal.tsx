import { useState } from "react";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RidePreset } from "@/types/settings";

interface EditRidePresetModalProps {
    isOpen: boolean;
    onClose: () => void;
    preset: RidePreset | null;
    onUpdate: (id: string, data: { value: number; location: string }) => Promise<boolean>;
    isUpdating: boolean;
}

function EditRidePresetForm({
    preset,
    onClose,
    onUpdate,
    isUpdating,
}: {
    preset: RidePreset;
    onClose: () => void;
    onUpdate: (id: string, data: { value: number; location: string }) => Promise<boolean>;
    isUpdating: boolean;
}) {
    const [editValue, setEditValue] = useState(() => preset.value.toString());
    const [editLocation, setEditLocation] = useState(() => preset.location);

    const handleSave = async () => {
        const success = await onUpdate(preset.id, {
            value: Number(editValue),
            location: editLocation,
        });

        if (success) {
            onClose();
        }
    };

    return (
        <>
            <div className="space-y-6 py-6 border-y border-border-subtle my-4">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Valor Sugerido (R$)</Label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">R$</span>
                        <input
                            type="number"
                            value={editValue}
                            onChange={(event) => setEditValue(event.target.value)}
                            className="w-full bg-muted border border-border-subtle h-12 pl-12 rounded-xl focus:ring-primary font-bold text-text-primary text-sm outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-text-muted uppercase tracking-widest ml-1">Localidade Padrão</Label>
                    <Input
                        value={editLocation}
                        onChange={(event) => setEditLocation(event.target.value)}
                        className="bg-muted border-border-subtle h-12 rounded-xl focus:ring-primary text-text-primary font-medium"
                        placeholder="Ex: Centro, Bairro..."
                    />
                </div>
            </div>

            <DialogFooter className="flex-row gap-3">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1 h-12 rounded-xl text-text-muted font-bold hover:bg-hover-accent"
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-lg shadow-primary/20"
                >
                    {isUpdating ? "Salvando..." : "Salvar Alterações"}
                </Button>
            </DialogFooter>
        </>
    );
}

export function EditRidePresetModal({
    isOpen,
    onClose,
    preset,
    onUpdate,
    isUpdating,
}: EditRidePresetModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-card-background border-border-subtle text-text-primary rounded-[2rem] w-[95%] max-w-sm mx-auto p-8 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-text-primary">
                        <Pencil size={20} className="text-primary" />
                        Editar Atalho
                    </DialogTitle>
                </DialogHeader>

                {preset ? (
                    <EditRidePresetForm
                        key={preset.id}
                        preset={preset}
                        onClose={onClose}
                        onUpdate={onUpdate}
                        isUpdating={isUpdating}
                    />
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
