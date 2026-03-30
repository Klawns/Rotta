"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TutorialModal } from "@/components/dashboard/tutorial-modal";
import { SubscriptionExpiringPopup } from "@/components/dashboard/subscription-expiring-popup";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/hooks/use-auth";
import { parseApiError } from "@/lib/api-error";
import { authKeys } from "@/lib/query-keys";
import { settingsService } from "@/services/settings-service";

interface PopupsManagerProps {
    user: User | null;
    isLoading: boolean;
    showExpiringPopup: boolean;
    daysRemaining: number;
}

function shouldShowTutorial(
    user: User | null,
    isLoading: boolean,
    dismissedTutorialUserId: string | null,
) {
    if (isLoading || !user || user.role !== "user" || user.hasSeenTutorial) {
        return false;
    }

    const hasActivePlan =
        user.subscription?.status === "active" ||
        user.subscription?.status === "trial";

    return hasActivePlan && dismissedTutorialUserId !== user.id;
}

/**
 * Gerenciador centralizado de Popups e Modais do Dashboard.
 * Isola a lógica de visibilidade e interações de tutorial do layout principal.
 */
export function PopupsManager({ 
    user, 
    isLoading, 
    showExpiringPopup, 
    daysRemaining 
}: PopupsManagerProps) {
    const [dismissedTutorialUserId, setDismissedTutorialUserId] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const tutorialMutation = useMutation({
        mutationFn: () => settingsService.markTutorialSeen(),
        onSuccess: () => {
            queryClient.setQueryData<User | null>(authKeys.user(), (currentUser) =>
                currentUser ? { ...currentUser, hasSeenTutorial: true } : currentUser,
            );
        },
        onError: (error) => {
            toast({
                title: "Erro ao atualizar tutorial",
                description: parseApiError(error, "Tente novamente."),
                variant: "destructive",
            });
        },
    });

    const isTutorialOpen = useMemo(() => {
        return shouldShowTutorial(user, isLoading, dismissedTutorialUserId);
    }, [dismissedTutorialUserId, isLoading, user]);

    async function handleCloseTutorial() {
        if (user) {
            setDismissedTutorialUserId(user.id);
        }
        if (!user || tutorialMutation.isPending) return;
        tutorialMutation.mutate();
    }

    return (
        <>
            <TutorialModal isOpen={isTutorialOpen} onClose={handleCloseTutorial} />

            {showExpiringPopup && (
                <SubscriptionExpiringPopup daysRemaining={daysRemaining} />
            )}
        </>
    );
}
