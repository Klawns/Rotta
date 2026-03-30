"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, UserPlus } from "lucide-react";
import { parseApiError } from "@/lib/api-error";
import { adminService } from "@/services/admin-service";
import { type CreateAdminUserInput } from "@/types/admin";
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

interface CreateUserModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateUserModal({
    open,
    onOpenChange,
    onSuccess,
}: CreateUserModalProps) {
    const [form, setForm] = useState<CreateAdminUserInput>({
        name: "",
        email: "",
        password: "",
    });

    const createUserMutation = useMutation({
        mutationFn: (data: CreateAdminUserInput) => adminService.createUser(data),
        onSuccess: () => {
            resetAndClose();
            onSuccess();
        },
    });

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            password: "",
        });
    };

    const resetAndClose = () => {
        resetForm();
        createUserMutation.reset();
        onOpenChange(false);
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            resetForm();
            createUserMutation.reset();
        }

        onOpenChange(nextOpen);
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        createUserMutation.mutate(form);
    };

    const isLoading = createUserMutation.isPending;
    const error = createUserMutation.error
        ? parseApiError(createUserMutation.error, "Ocorreu um erro ao criar o usuario.")
        : null;

    return (
        <Dialog open={open} onOpenChange={(nextOpen) => !isLoading && handleOpenChange(nextOpen)}>
            <DialogContent className="max-w-md border-white/10 bg-slate-900 text-white">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold text-blue-400">
                        <UserPlus size={24} />
                        Cadastrar Novo Usuario
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Preencha os dados abaixo para criar uma conta manualmente para o cliente.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">Nome Completo</Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            value={form.name}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, name: event.target.value }))
                            }
                            placeholder="Nome do cliente"
                            className="border-white/5 bg-slate-950 focus:ring-blue-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-semibold">E-mail</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, email: event.target.value }))
                            }
                            placeholder="cliente@email.com"
                            className="border-white/5 bg-slate-950 focus:ring-blue-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-semibold">Senha Inicial</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            value={form.password}
                            onChange={(event) =>
                                setForm((current) => ({ ...current, password: event.target.value }))
                            }
                            placeholder="******"
                            className="border-white/5 bg-slate-950 focus:ring-blue-500/50"
                        />
                    </div>

                    {error && (
                        <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <DialogFooter className="pt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={resetAndClose}
                            disabled={isLoading}
                            className="border-white/10 text-white hover:bg-white/5"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="min-w-[120px] gap-2 bg-blue-600 font-bold text-white hover:bg-blue-500"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : "Criar Usuario"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
