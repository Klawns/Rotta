"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authKeys } from "@/lib/query-keys";
import { useAuth } from "@/hooks/use-auth";
import { usePaymentPlans } from "@/hooks/use-payment-plans";
import { TaxDataValues } from "../_components/tax-data-modal";

export function useCheckout() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();

    const planId = searchParams.get("plan");
    const [error, setError] = useState("");
    const [isTaxModalDismissed, setIsTaxModalDismissed] = useState(false);

    const { data: plans = [], isLoading: isLoadingPlans } = usePaymentPlans();

    const checkoutMutation = useMutation({
        mutationFn: async (_data: TaxDataValues) => {
            await new Promise((resolve) => setTimeout(resolve, 1500));
            return { blocked: true };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: authKeys.user() });
            router.push("/contato");
        },
        onError: () => {
            setError("Ocorreu um erro ao processar seu pedido. Tente novamente em instantes.");
        },
    });

    const selectedPlan = useMemo(
        () => plans.find((plan) => plan.id === planId) ?? null,
        [planId, plans],
    );

    const showTaxModal = useMemo(
        () =>
            Boolean(
                user &&
                    !isLoadingPlans &&
                    !checkoutMutation.isPending &&
                    !error &&
                    planId &&
                    planId !== "starter" &&
                    !isTaxModalDismissed,
            ),
        [
            checkoutMutation.isPending,
            error,
            isLoadingPlans,
            isTaxModalDismissed,
            planId,
            user,
        ],
    );

    useEffect(() => {
        if (!user || isLoadingPlans || checkoutMutation.isPending || error) {
            return;
        }

        if (!planId || planId === "starter") {
            router.push("/dashboard");
        }
    }, [
        checkoutMutation.isPending,
        error,
        isLoadingPlans,
        planId,
        router,
        user,
    ]);

    const retry = () => {
        setError("");
        setIsTaxModalDismissed(false);
    };

    const goToDashboard = () => {
        router.push("/dashboard");
    };

    const setShowTaxModal = (open: boolean) => {
        setIsTaxModalDismissed(!open);
    };

    const submitTaxData = (data: TaxDataValues) => {
        checkoutMutation.mutate(data);
    };

    return {
        error,
        selectedPlan,
        isCreatingCheckout: checkoutMutation.isPending,
        showTaxModal,
        setShowTaxModal,
        retry,
        goToDashboard,
        submitTaxData,
    };
}
