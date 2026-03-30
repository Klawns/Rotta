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
    const checkPaymentStatusRef = useRef<() => Promise<void>>(async () => {});

    const clearPendingTimeout = useCallback(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
    }, []);

    const scheduleVerification = useCallback((delayMs: number) => {
        clearPendingTimeout();
        timeoutRef.current = setTimeout(() => {
            void checkPaymentStatusRef.current();
        }, delayMs);
    }, [clearPendingTimeout]);

    const checkPaymentStatus = useCallback(async () => {
        try {
            const refreshedUser = await verify();

            if (!isMounted.current) {
                return;
            }

            if (
                refreshedUser?.subscription?.plan !== "starter" &&
                refreshedUser?.subscription?.status === "active"
            ) {
                clearPendingTimeout();
                setStatus("success");
                return;
            }

            setAttempts((prev) => {
                const nextAttempts = prev + 1;

                if (nextAttempts < maxAttempts) {
                    scheduleVerification(intervalMs);
                } else {
                    clearPendingTimeout();
                    setStatus("delay");
                }

                return nextAttempts;
            });
        } catch {
            if (!isMounted.current) {
                return;
            }

            clearPendingTimeout();
            setStatus("error");
        }
    }, [verify, maxAttempts, intervalMs, clearPendingTimeout, scheduleVerification]);

    useEffect(() => {
        checkPaymentStatusRef.current = checkPaymentStatus;
    }, [checkPaymentStatus]);

    const retry = useCallback(() => {
        if (!isMounted.current) {
            return;
        }

        setAttempts(0);
        setStatus("verifying");
        scheduleVerification(initialDelayMs);
    }, [initialDelayMs, scheduleVerification]);

    useEffect(() => {
        isMounted.current = true;
        scheduleVerification(initialDelayMs);

        return () => {
            isMounted.current = false;
            clearPendingTimeout();
        };
    }, [initialDelayMs, scheduleVerification, clearPendingTimeout]);

    return {
        status,
        attempts,
        maxAttempts,
        retry,
    };
}
