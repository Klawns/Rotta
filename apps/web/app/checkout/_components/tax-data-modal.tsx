"use client";

import { Loader2, ArrowRight, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

export const taxDataSchema = z.object({
    taxId: z.string().min(14, "CPF inválido").max(14, "CPF inválido"),
    cellphone: z.string().min(14, "Telefone inválido"),
});

export type TaxDataValues = z.infer<typeof taxDataSchema>;

interface TaxDataModalProps {
    isOpen: boolean;
    isLoading: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: TaxDataValues) => void;
}

function formatCPF(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})/, "$1-$2")
        .replace(/(-\d{2})\d+?$/, "$1");
}

function formatPhone(value: string) {
    return value
        .replace(/\D/g, "")
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2")
        .replace(/(-\d{4})\d+?$/, "$1");
}

export function TaxDataModal({
    isOpen,
    isLoading,
    onOpenChange,
    onSubmit,
}: TaxDataModalProps) {
    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<TaxDataValues>({
        resolver: zodResolver(taxDataSchema),
        defaultValues: {
            taxId: "",
            cellphone: "",
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px] bg-slate-950 border-white/10 p-0 overflow-hidden rounded-[2.5rem]">
                <div className="relative p-8 pt-10">
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-600/10 to-transparent pointer-events-none" />

                    <DialogHeader className="relative space-y-4 mb-8">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                            <ShieldCheck className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="space-y-2">
                            <DialogTitle className="text-2xl font-black text-white tracking-tight">
                                Dados de Faturamento
                            </DialogTitle>
                            <DialogDescription className="text-slate-400 text-base">
                                Precisamos de mais algumas informações para processar sua assinatura com segurança.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="taxId" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">CPF</Label>
                                <Input
                                    id="taxId"
                                    placeholder="000.000.000-00"
                                    {...register("taxId")}
                                    onChange={(event) => setValue("taxId", formatCPF(event.target.value))}
                                    className={cn(
                                        "bg-white/5 border-white/10 h-14 rounded-2xl pl-4 text-white placeholder:text-slate-600 transition-all focus:ring-2 focus:ring-blue-500/40",
                                        errors.taxId && "border-red-500/50 bg-red-500/5",
                                    )}
                                />
                                {errors.taxId && (
                                    <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">
                                        {errors.taxId.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cellphone" className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Telefone WhatsApp</Label>
                                <Input
                                    id="cellphone"
                                    placeholder="(00) 00000-0000"
                                    {...register("cellphone")}
                                    onChange={(event) => setValue("cellphone", formatPhone(event.target.value))}
                                    className={cn(
                                        "bg-white/5 border-white/10 h-14 rounded-2xl pl-4 text-white placeholder:text-slate-600 transition-all focus:ring-2 focus:ring-blue-500/40",
                                        errors.cellphone && "border-red-500/50 bg-red-500/5",
                                    )}
                                />
                                {errors.cellphone && (
                                    <p className="text-red-400 text-[10px] font-black uppercase tracking-wider ml-1">
                                        {errors.cellphone.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white h-16 rounded-[1.25rem] font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-[0.98] shadow-2xl shadow-blue-500/20 group"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-3">
                                    Continuar para Pagamento
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>

                        <p className="text-center text-[10px] text-slate-500 uppercase tracking-widest font-black">
                            Seus dados estão protegidos por criptografia de ponta a ponta
                        </p>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
