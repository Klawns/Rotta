"use client";

import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

/**
 * Hook especializado para gerenciar o estado da interface (UI) do dashboard.
 * Encapsula paginação e detecção de dispositivo móvel.
 */
export function useDashboardUI() {
    const isMobile = useIsMobile();
    const [activitiesPage, setActivitiesPage] = useState(1);
    const itemsPerPage = 4;

    return {
        isMobile,
        activitiesPage,
        setActivitiesPage,
        itemsPerPage
    };
}
