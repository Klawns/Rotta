"use client";

import { useState, useEffect, useCallback } from "react";
import { clientService, Client } from "../_services/client-service";

export function useClients() {
    const [clients, setClients] = useState<Client[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    
    // Pagination
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const limit = 9;

    const fetchClients = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await clientService.fetchClients({
                limit,
                offset: (page - 1) * limit,
                search
            });
            setClients(result.clients);
            setTotal(result.total);
        } catch (err) {
            console.error("Erro ao buscar clientes", err);
        } finally {
            setIsLoading(false);
        }
    }, [page, search]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    return {
        clients,
        search,
        setSearch,
        isLoading,
        page,
        setPage,
        total,
        limit,
        fetchClients
    };
}
