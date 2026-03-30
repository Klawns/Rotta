"use client";

import type { Client } from "@/types/rides";
import { useClientCreationDialog } from "./use-client-creation-dialog";
import { useClientDirectoryState } from "./use-client-directory-state";

export interface ClientSelectionDirectory {
    clients: Client[];
    isLoading: boolean;
    isFetchingNextPage: boolean;
    hasMore: boolean;
    loadMore: () => void;
    error: unknown;
    retry: () => void;
}

export interface ClientCreationDialogState {
    isOpen: boolean;
    open: () => void;
    close: () => void;
    name: string;
    setName: (name: string) => void;
    isCreating: boolean;
    submit: () => Promise<void>;
}

interface UseClientSelectionProps {
    onClientCreated?: (client: Client) => void;
}

export function useClientSelection({ onClientCreated }: UseClientSelectionProps = {}) {
    const { directory } = useClientDirectoryState();
    const creationDialog = useClientCreationDialog({ onCreated: onClientCreated });

    return {
        directory,
        creationDialog,
    };
}
