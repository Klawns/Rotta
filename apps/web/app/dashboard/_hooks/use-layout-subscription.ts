"use client";

import { useMemo } from "react";
import { User } from "@/hooks/use-auth";

/**
 * Hook especializado para calcular estados de assinatura (expiração, prazos, etc).
 */
export function useLayoutSubscription(user: User | null) {
    return useMemo(() => {
        if (!user || user.role !== 'user' || !user.subscription) {
            return {
                isExpired: false,
                isExpiringSoon: false,
                daysRemaining: 0,
                showExpiringPopup: false
            };
        }

        const { status, validUntil, plan } = user.subscription;
        const isExpired = status === 'expired';
        
        const expirationDate = validUntil ? new Date(validUntil) : null;
        const now = new Date();
        const diffInMs = expirationDate ? expirationDate.getTime() - now.getTime() : 0;
        const daysRemaining = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

        // Regras de exibição de Banners e Popups
        const isExpiringSoon = !isExpired && !!expirationDate && (diffInMs < 5 * 24 * 60 * 60 * 1000);
        const showExpiringPopup = !isExpired && plan !== 'starter' && daysRemaining > 0 && daysRemaining <= 3;

        return {
            isExpired,
            isExpiringSoon,
            daysRemaining,
            showExpiringPopup
        };
    }, [user]);
}
