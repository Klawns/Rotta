"use client";

import { motion } from "framer-motion";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentStatus } from "../../types";

interface StepPaymentStatusProps {
    paymentStatus: PaymentStatus;
    setPaymentStatus: (status: PaymentStatus) => void;
}

export function StepPaymentStatus({
    paymentStatus,
    setPaymentStatus
}: StepPaymentStatusProps) {
    return (
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-1 flex items-center gap-2">
                    <DollarSign size={12} /> Status do Pagamento
                </label>
                <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950/50 rounded-[2rem] border border-white/5">
                    <button
                        type="button"
                        onClick={() => setPaymentStatus('PENDING')}
                        className={cn(
                            "py-4 rounded-[1.75rem] text-[11px] font-black transition-all uppercase tracking-widest",
                            paymentStatus === 'PENDING' ? "bg-red-500 text-white shadow-lg shadow-red-500/20 scale-[1.02]" : "text-slate-600 hover:text-slate-400"
                        )}
                    >
                        Não Pago
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentStatus('PAID')}
                        className={cn(
                            "py-4 rounded-[1.75rem] text-[11px] font-black transition-all uppercase tracking-widest",
                            paymentStatus === 'PAID' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]" : "text-slate-600 hover:text-slate-400"
                        )}
                    >
                        Pago
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
