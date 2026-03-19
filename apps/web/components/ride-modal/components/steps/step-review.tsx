"use client";

import { motion } from "framer-motion";
import { User, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { Client, PaymentStatus } from "../../types";

interface StepReviewProps {
    clients: Client[];
    selectedClientId: string;
    clientName?: string;
    value: string;
    paymentStatus: PaymentStatus;
    location: string;
    rideDate?: string;
    notes?: string;
    photo?: string | null;
}

export function StepReview({
    clients,
    selectedClientId,
    clientName,
    value,
    paymentStatus,
    location,
    rideDate,
    notes,
    photo
}: StepReviewProps) {
    const selectedClient = clients.find((c) => c.id === selectedClientId);

    return (
        <motion.div
            key="step5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="space-y-6"
        >
            <div className="bg-slate-950/40 border border-white/5 rounded-[2.5rem] p-6 space-y-4">
                <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Cliente</p>
                        <p className="text-white font-bold">{selectedClient?.name || clientName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-2">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Valor</p>
                        <p className="text-2xl font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value))}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Pagamento</p>
                        <div className="flex flex-wrap gap-1.5">
                            <span className={cn(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded-full",
                                paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-500"
                            )}>{paymentStatus === 'PAID' ? 'Pago' : 'Não Pago'}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">Localização</p>
                    <p className="text-sm text-slate-300 font-bold">{location}</p>
                </div>

                {(rideDate || notes || photo) && (
                    <div className="pt-4 border-t border-white/5 space-y-4">
                        {rideDate && (
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Data Agendada</p>
                                <p className="text-sm text-slate-400 font-medium">{new Date(rideDate).toLocaleString()}</p>
                            </div>
                        )}
                        {notes && (
                            <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Observações</p>
                                <p className="text-sm text-slate-400 italic">"{notes}"</p>
                            </div>
                        )}
                        {photo && (
                            <div className="flex items-center gap-2 text-blue-400">
                                <Camera size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Foto Anexada</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
