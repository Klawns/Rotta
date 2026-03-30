"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { usePaymentVerification } from "./_hooks/use-payment-verification";

import { VerifyingState } from "./_components/verifying-state";
import { SuccessState } from "./_components/success-state";
import { DelayState } from "./_components/delay-state";
import { ErrorState } from "./_components/error-state";

export default function PaymentSuccessPage() {
    const { user } = useAuth();
    const { status, attempts, maxAttempts, retry } = usePaymentVerification();

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-lime-500/10 via-slate-950 to-slate-950">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-slate-900 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl text-center relative overflow-hidden"
            >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-lime-500/10 blur-3xl rounded-full" />

                <AnimatePresence mode="wait">
                    {status === "verifying" && (
                        <VerifyingState attempts={attempts} maxAttempts={maxAttempts} />
                    )}

                    {status === "success" && <SuccessState />}

                    {status === "delay" && <DelayState onRetry={retry} />}

                    {status === "error" && <ErrorState onRetry={retry} />}
                </AnimatePresence>

                <p className="mt-10 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
                    Suporte Rotta | ID Transacao: {user?.id?.slice(0, 8)}
                </p>
            </motion.div>
        </div>
    );
}
