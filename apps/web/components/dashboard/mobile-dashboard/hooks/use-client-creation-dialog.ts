"use client";

import { useCallback, useMemo, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useCreateClientMutation } from "@/hooks/mutations/use-create-client-mutation";
import { parseApiError } from "@/lib/api-error";
import type { Client } from "@/types/rides";
import type { ClientCreationDialogState } from "./use-client-selection";

interface UseClientCreationDialogProps {
    onCreated?: (client: Client) => void;
}

export function useClientCreationDialog({ onCreated }: UseClientCreationDialogProps = {}) {
    const { toast } = useToast();

    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");

    const close = useCallback(() => {
        setIsOpen(false);
        setName("");
    }, []);

    const mutation = useCreateClientMutation({
        onSuccess: async (client) => {
            close();
            toast({ title: "Cliente cadastrado!" });
            onCreated?.(client);
        },
        onError: async (error) => {
            toast({
                title: parseApiError(error, "Erro ao cadastrar"),
                variant: "destructive",
            });
        },
    });

    const submit = useCallback(async () => {
        const trimmedName = name.trim();

        if (!trimmedName) {
            return;
        }

        await mutation.mutateAsync({ name: trimmedName });
    }, [mutation, name]);

    return useMemo<ClientCreationDialogState>(
        () => ({
            isOpen,
            open: () => setIsOpen(true),
            close,
            name,
            setName,
            isCreating: mutation.isPending,
            submit,
        }),
        [close, isOpen, mutation.isPending, name, submit],
    );
}
