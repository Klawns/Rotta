import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";

export type PaymentStatus = "verifying" | "success" | "delay" | "error";

interface UsePaymentVerificationProps {
    maxAttempts?: number;
    intervalMs?: number;
    initialDelayMs?: number;
}

export function usePaymentVerification({
    maxAttempts = 5,
    intervalMs = 3000,
    initialDelayMs = 2000,
}: UsePaymentVerificationProps = {}) {
    const { verify } = useAuth();
    const [status, setStatus] = useState<PaymentStatus>("verifying");
    const [attempts, setAttempts] = useState(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isMounted = useRef(true);

    const checkPaymentStatus = useCallback(async () => {
        try {
            const refreshedUser = await verify();

            if (!isMounted.current) return;

            // Se o plano não for mais starter e estiver ativo, sucesso!
            if (
                refreshedUser?.subscription?.plan !== "starter" &&
                refreshedUser?.subscription?.status === "active"
            ) {
                setStatus("success");
                return;
            }

            // Se ainda for starter, incrementa tentativas
            setAttempts((prev) => {
                const nextAttempts = prev + 1;
                if (nextAttempts < maxAttempts) {
                    timeoutRef.current = setTimeout(checkPaymentStatus, intervalMs);
                } else {
                    setStatus("delay");
                }
                return nextAttempts;
            });
        } catch (err) {
            console.error("Erro ao verificar status:", err);
            if (isMounted.current) setStatus("error");
        }
    }, [verify, maxAttempts, intervalMs]);

    useEffect(() => {
        isMounted.current = true;
        timeoutRef.current = setTimeout(checkPaymentStatus, initialDelayMs);

        return () => {
            isMounted.current = false;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [checkPaymentStatus, initialDelayMs]);

    return {
        status,
        attempts,
        maxAttempts,
        retry: () => {
            setAttempts(0);
            setStatus("verifying");
            checkPaymentStatus();
        },
    };
}
