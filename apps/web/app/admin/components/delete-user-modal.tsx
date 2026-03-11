"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteUserModalProps {
    user: { id: string, name: string, email: string } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (userId: string) => Promise<void>;
}

export function DeleteUserModal({ user, open, onOpenChange, onConfirm }: DeleteUserModalProps) {
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const handleConfirm = async () => {
        if (!user || confirmText !== "EXCLUIR") return;

        setIsDeleting(true);
        try {
            await onConfirm(user.id);
            onOpenChange(false);
            setConfirmText("");
        } catch (error) {
            console.error("Erro ao deletar usuário:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isDeleting && onOpenChange(val)}>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-500">
                        <AlertTriangle size={24} />
                        Excluir Usuário?
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Esta ação é irreversível. O usuário <strong>{user?.name}</strong> ({user?.email}) será removido permanentemente, junto com todas as suas corridas e clientes.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="verification" className="text-sm font-semibold">
                            Digite <span className="text-red-400">EXCLUIR</span> para confirmar:
                        </Label>
                        <Input
                            id="verification"
                            placeholder="Digite aqui..."
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                            className="bg-slate-950 border-white/5 focus:ring-red-500/50"
                        />
                    </div>
                </div>

                <DialogFooter className="pt-6 gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isDeleting}
                        className="border-white/10 text-white hover:bg-white/5"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={confirmText !== "EXCLUIR" || isDeleting}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold gap-2"
                    >
                        {isDeleting ? "Excluindo..." : (
                            <>
                                <Trash2 size={16} />
                                Confirmar Exclusão
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
