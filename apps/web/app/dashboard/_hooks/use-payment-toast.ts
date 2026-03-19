"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_SUCCESS_KEY = 'payment_success_shown';

/**
 * Hook especializado para exibir notificações de pagamento.
 * Isola a lógica de side-effect que utiliza searchParams e localStorage.
 */
export function usePaymentToast() {
    const searchParams = useSearchParams();
    const { toast } = useToast();

    useEffect(() => {
        const isPaymentSuccess = searchParams.get('payment') === 'success';

        if (isPaymentSuccess) {
            const hasShownToast = localStorage.getItem(PAYMENT_SUCCESS_KEY);
            
            if (!hasShownToast) {
                toast({
                    title: "Pagamento Confirmado! 🎉",
                    description: "Seu plano foi atualizado com sucesso. Aproveite todos os recursos!",
                });
                localStorage.setItem(PAYMENT_SUCCESS_KEY, 'true');
            }
            
            // Limpa o parâmetro da URL sem recarregar a página
            window.history.replaceState({}, '', '/dashboard');
        } else {
            localStorage.removeItem(PAYMENT_SUCCESS_KEY);
        }
    }, [searchParams, toast]);
}
