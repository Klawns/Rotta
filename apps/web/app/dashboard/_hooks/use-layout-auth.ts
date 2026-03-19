"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/hooks/use-auth";

interface UseLayoutAuthProps {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

/**
 * Hook especializado para gerenciar proteções de rota e redirecionamentos no Layout.
 */
export function useLayoutAuth({ user, isLoading, isAuthenticated }: UseLayoutAuthProps) {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        // 1. Não autenticado -> Login
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // 2. Admin no dashboard de usuário -> /admin
        if (user?.role === 'admin') {
            router.push("/admin");
            return;
        }

        // 3. Controle de acesso baseado em assinatura (Planos & Limites)
        if (user?.role === 'user') {
            const isStarter = user?.subscription?.plan === 'starter';
            const hasPaidPlan = user?.subscription?.plan === 'premium' || user?.subscription?.plan === 'lifetime';
            const isActive = user?.subscription?.status === 'active' || user?.subscription?.status === 'trial';
            const rideCount = user?.subscription?.rideCount || 0;

            const reachedLimit = isStarter && rideCount >= 20;
            const shouldBlock = reachedLimit || (!hasPaidPlan && !isStarter) || !isActive;

            // Bloqueia acesso a rotas do dashboard se as condições não forem atendidas
            if (shouldBlock && pathname.startsWith('/dashboard') && pathname !== '/dashboard/payment-success') {
                router.push("/pricing?reason=limit_reached");
            }
        }
    }, [isLoading, isAuthenticated, user, router, pathname]);
}
