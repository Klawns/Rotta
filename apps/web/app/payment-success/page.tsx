"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { usePaymentVerification } from "../dashboard/payment-success/_hooks/use-payment-verification";

// Components (Using shared components from dashboard as they are visually similar or better)
import { VerifyingState } from "../dashboard/payment-success/_components/verifying-state";
import { SuccessState } from "../dashboard/payment-success/_components/success-state";
import { DelayState } from "../dashboard/payment-success/_components/delay-state";
import { ErrorState } from "../dashboard/payment-success/_components/error-state";

export default function PaymentSuccessPage() {
    const { user } = useAuth();
    // A página da root pedia 120s (60 tentativas * 2s), vamos ajustar o hook se necessário
    // ou manter o padrão de 5 tentativas * 3s = 15s para uma experiência mais rápida, 
    // mas se o usuário quiser a mesma duração original:
    const { status, attempts, maxAttempts } = usePaymentVerification({
        maxAttempts: 60,
        intervalMs: 2000,
        initialDelayMs: 2000
    });

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8">
                <AnimatePresence mode="wait">
                    {status === 'verifying' && (
                        <VerifyingState attempts={attempts} maxAttempts={maxAttempts} />
                    )}

                    {status === 'success' && (
                        <SuccessState />
                    )}

                    {status === 'delay' && (
                        <DelayState />
                    )}

                    {status === 'error' && (
                        <ErrorState />
                    )}
                </AnimatePresence>
                
                {user && (
                    <p className="mt-10 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
                        ID Transação: {user.id.slice(0, 8)}
                    </p>
                )}
            </div>
        </div>
    );
}
