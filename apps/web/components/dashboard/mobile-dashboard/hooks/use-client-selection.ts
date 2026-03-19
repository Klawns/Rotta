"use client";

import { useState, useCallback } from "react";
import { useClients } from "@/providers/clients-provider";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";
import { Client } from "../types";
import { CLIENTS_PER_PAGE } from "../constants";

export function useClientSelection() {
    const { toast } = useToast();
    const { clients, refetchClients } = useClients();
    
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [isCreatingClient, setIsCreatingClient] = useState(false);
    const [clientPage, setClientPage] = useState(0);

    const handleCreateClient = useCallback(async (onCreated?: (client: Client) => void) => {
        if (!newClientName) return;
        setIsCreatingClient(true);
        try {
            const { data } = await api.post("/clients", { name: newClientName });
            await refetchClients();
            setIsClientModalOpen(false);
            setNewClientName("");
            toast({ title: "Cliente cadastrado! 👤" });
            if (onCreated) onCreated(data);
        } catch (err) {
            toast({ title: "Erro ao cadastrar", variant: "destructive" });
        } finally {
            setIsCreatingClient(false);
        }
    }, [newClientName, refetchClients, toast]);

    const totalPages = Math.ceil(clients.length / CLIENTS_PER_PAGE);
    const paginatedClients = clients.slice(clientPage * CLIENTS_PER_PAGE, (clientPage + 1) * CLIENTS_PER_PAGE);

    return {
        clients,
        paginatedClients,
        clientPage,
        setClientPage,
        totalPages,
        isClientModalOpen,
        setIsClientModalOpen,
        newClientName,
        setNewClientName,
        isCreatingClient,
        handleCreateClient
    };
}
