"use client";

import { useMemo } from "react";
import type { Client } from "@/types/rides";
import { CLIENTS_PER_PAGE } from "../constants";
import type { ClientSelectionDirectory } from "./use-client-selection";
import { useInfiniteClients } from "./use-infinite-clients";

function getUniqueClients(clients: Client[]) {
    return Array.from(
        new Map(
            clients
                .filter((client) => client && client.id)
                .map((client) => [String(client.id), client]),
        ).values(),
    );
}

export function useClientDirectoryState() {
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
        error,
        refetch,
    } = useInfiniteClients({
        limit: CLIENTS_PER_PAGE,
    });

    const clients = useMemo(() => {
        const allClients = data?.pages.flatMap((page) => page.data || []) || [];
        return getUniqueClients(allClients);
    }, [data]);

    const directory = useMemo<ClientSelectionDirectory>(
        () => ({
            clients,
            isLoading,
            isFetchingNextPage,
            hasMore: !!hasNextPage,
            loadMore: fetchNextPage,
            error: isError ? error : null,
            retry: refetch,
        }),
        [
            clients,
            isLoading,
            isFetchingNextPage,
            hasNextPage,
            fetchNextPage,
            isError,
            error,
            refetch,
        ],
    );

    return {
        directory,
        refetchClients: refetch,
    };
}
