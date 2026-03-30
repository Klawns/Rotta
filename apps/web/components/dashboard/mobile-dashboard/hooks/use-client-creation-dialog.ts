"use client";

import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { parseApiError } from "@/lib/api-error";
import { clientKeys } from "@/lib/query-keys";
import { clientsService } from "@/services/clients-service";
import type { Client } from "@/types/rides";
import type { ClientCreationDialogState } from "./use-client-selection";

interface UseClientCreationDialogProps {
    onCreated?: (client: Client) => void;
}

export function useClientCreationDialog({ onCreated }: UseClientCreationDialogProps = {}) {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const close = useCallback(() => {
        setIsOpen(false);
        setName("");
    }, []);

    const submit = useCallback(async () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        setIsCreating(true);
        try {
            const client = await clientsService.createClient({ name: trimmedName });
            await queryClient.invalidateQueries({ queryKey: clientKeys.all });
            close();
            toast({ title: "Cliente cadastrado!" });
            onCreated?.(client);
        } catch (error) {
            toast({
                title: parseApiError(error, "Erro ao cadastrar"),
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    }, [close, name, onCreated, queryClient, toast]);

    return useMemo<ClientCreationDialogState>(
        () => ({
            isOpen,
            open: () => setIsOpen(true),
            close,
            name,
            setName,
            isCreating,
            submit,
        }),
        [close, isCreating, isOpen, name, submit],
    );
}
