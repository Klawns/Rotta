"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";

export interface ClientData {
    id: string;
    name: string;
    isPinned?: boolean;
    userId?: string;
    createdAt?: string;
}

interface ClientsContextValue {
    clients: ClientData[];
    isLoading: boolean;
    refetchClients: () => Promise<void>;
}

const ClientsContext = createContext<ClientsContextValue | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [clients, setClients] = useState<ClientData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchClients = useCallback(async () => {
        if (!user) return;

        try {
            const { data } = await api.get("/clients");
            setClients(data.clients || []);
        } catch (err) {
            console.error("[ClientsProvider] Erro ao buscar clientes", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    return (
        <ClientsContext.Provider value={{ clients, isLoading, refetchClients: fetchClients }}>
            {children}
        </ClientsContext.Provider>
    );
}

export function useClients(): ClientsContextValue {
    const context = useContext(ClientsContext);
    if (!context) {
        throw new Error("useClients must be used within a ClientsProvider");
    }
    return context;
}
