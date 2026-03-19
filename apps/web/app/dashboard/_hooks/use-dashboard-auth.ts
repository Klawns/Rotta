"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/hooks/use-auth";

interface UseDashboardAuthProps {
    user: User | null;
}

/**
 * Hook especializado para lógica de autenticação do dashboard.
 * Atualmente responsável apenas por redirecionar administradores.
 */
export function useDashboardAuth({ user }: UseDashboardAuthProps) {
    const router = useRouter();

    useEffect(() => {
        if (user?.role === 'admin') {
            router.push('/admin');
        }
    }, [user, router]);
}
