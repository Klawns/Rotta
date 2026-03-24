import { useState, useMemo, useEffect } from 'react';

/**
 * Hook para gerenciar a estratégia híbrida de renderização de listas.
 * Decide entre renderização direta (.map) ou virtualização baseada em um threshold.
 * Uma vez que a virtualização é ativada, ela permanece ativa para evitar flickering.
 */
export const VIRTUALIZATION_THRESHOLD = 100;

interface UseHybridListOptions {
    threshold?: number;
    enabled?: boolean;
}

export function useHybridList<T>(data: T[], options: UseHybridListOptions = {}) {
    const { threshold = VIRTUALIZATION_THRESHOLD, enabled = true } = options;
    
    // Estado para travar a virtualização uma vez que ela é ativada
    const [isVirtualizationLocked, setIsVirtualizationLocked] = useState(false);

    // Verifica se a virtualização deve estar ativa agora
    const shouldVirtualize = useMemo(() => {
        if (!enabled) return false;
        
        // Se já travou em virtualizado, permanece virtualizado
        if (isVirtualizationLocked) return true;

        // Se ultrapassou o limite, trava e ativa
        if (data.length > threshold) {
            setIsVirtualizationLocked(true);
            return true;
        }

        return false;
    }, [data.length, threshold, isVirtualizationLocked, enabled]);

    return {
        isVirtualizing: shouldVirtualize,
        resetVirtualization: () => setIsVirtualizationLocked(false)
    };
}
