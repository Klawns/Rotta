"use client";

import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { clientsService } from "@/services/clients-service";
import { useAuth } from "@/hooks/use-auth";
import { clientKeys } from "@/lib/query-keys";
import { Client as ClientData } from "@/types/rides";

interface ClientsContextValue {
    clients: ClientData[];
    isLoading: boolean;
    refetchClients: () => Promise<any>;
}

const ClientsContext = createContext<ClientsContextValue | null>(null);

export function ClientsProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    const { 
        data: response, 
        isLoading, 
        refetch 
    } = useQuery({
        queryKey: clientKeys.lists(),
        queryFn: ({ signal }) => clientsService.getClients(undefined, signal),
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 min
    });

    const clients = response?.data || [];

    // Validação temporária durante transição V2
    if (response && !Array.isArray(response.data)) {
        console.error('Formato inválido em response.data', response);
    }

    return (
        <ClientsContext.Provider value={{ 
            clients, 
            isLoading, 
            refetchClients: refetch 
        }}>
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
