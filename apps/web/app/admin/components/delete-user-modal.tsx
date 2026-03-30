"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { parseApiError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DeleteUserModalProps {
    user: { id: string; name: string; email: string } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (userId: string) => Promise<void>;
}

export function DeleteUserModal({
    user,
    open,
    onOpenChange,
    onConfirm,
}: DeleteUserModalProps) {
    const [confirmText, setConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const resetState = () => {
        setConfirmText("");
        setError(null);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            resetState();
        }

        onOpenChange(nextOpen);
    };

    useEffect(() => {
        resetState();
    }, [user?.id, open]);

    const handleConfirm = async () => {
        if (!user || confirmText !== "EXCLUIR") {
            return;
        }

        setIsDeleting(true);
        setError(null);

        try {
            await onConfirm(user.id);
            handleOpenChange(false);
        } catch (error) {
            setError(parseApiError(error, "Erro ao excluir usuario."));
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !isDeleting && handleOpenChange(nextOpen)}>
            <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-500">
                        <AlertTriangle size={24} />
                        Excluir Usuario?
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Esta acao e irreversivel. O usuario <strong>{user?.name}</strong> ({user?.email}) sera removido permanentemente, junto com todas as suas corridas e clientes.
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
                            onChange={(event) => setConfirmText(event.target.value.toUpperCase())}
                            className="bg-slate-950 border-white/5 focus:ring-red-500/50"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}
                </div>

                <DialogFooter className="pt-6 gap-2 sm:gap-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
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
                        {isDeleting ? (
                            "Excluindo..."
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Confirmar Exclusao
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
