"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { ClientCreationDialogState } from "../hooks/use-client-selection";

interface CreateClientDialogProps {
    dialog: ClientCreationDialogState;
}

export function CreateClientDialog({ dialog }: CreateClientDialogProps) {
    return (
        <AnimatePresence>
            {dialog.isOpen ? (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="w-full max-w-sm rounded-[2rem] border border-border bg-card p-6 shadow-2xl"
                    >
                        <h3 className="mb-4 text-xl font-bold text-foreground">Novo Cliente</h3>
                        <input
                            autoFocus
                            value={dialog.name}
                            onChange={(event) => dialog.setName(event.target.value)}
                            placeholder="Nome do cliente..."
                            className="mb-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-primary"
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={dialog.close}
                                className="flex-1 text-muted-foreground"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={dialog.submit}
                                disabled={!dialog.name.trim() || dialog.isCreating}
                                className="flex-1 bg-primary font-bold text-primary-foreground"
                            >
                                {dialog.isCreating ? "Criando..." : "Cadastrar"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>
    );
}
