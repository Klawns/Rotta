"use client";

import { useCallback, useState } from "react";
import type { Client } from "@/types/rides";

export function useSelectedClient() {
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const clearSelectedClient = useCallback(() => {
        setSelectedClient(null);
    }, []);

    return {
        selectedClient,
        setSelectedClient,
        clearSelectedClient,
    };
}
