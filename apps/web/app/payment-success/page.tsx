"use client";

import { AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { usePaymentVerification } from "../dashboard/payment-success/_hooks/use-payment-verification";
import { VerifyingState } from "../dashboard/payment-success/_components/verifying-state";
import { SuccessState } from "../dashboard/payment-success/_components/success-state";
import { DelayState } from "../dashboard/payment-success/_components/delay-state";
import { ErrorState } from "../dashboard/payment-success/_components/error-state";

export default function PaymentSuccessPage() {
    const { user } = useAuth();
    const { status, attempts, maxAttempts, retry } = usePaymentVerification({
        maxAttempts: 60,
        intervalMs: 2000,
        initialDelayMs: 2000,
    });

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8">
                <AnimatePresence mode="wait">
                    {status === 'verifying' && (
                        <VerifyingState attempts={attempts} maxAttempts={maxAttempts} />
                    )}

                    {status === 'success' && <SuccessState />}

                    {status === 'delay' && <DelayState onRetry={retry} />}

                    {status === 'error' && <ErrorState onRetry={retry} />}
                </AnimatePresence>

                {user ? (
                    <p className="mt-10 text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
                        ID Transacao: {user.id.slice(0, 8)}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
