"use client";

import { Loader2 } from "lucide-react";
import { PlanCard } from "./_components/plan-card";
import { useAdminPlans } from "./_hooks/use-admin-plans";

export default function PlansPage() {
    const { plans, isLoading, isSaving, updatePlan } = useAdminPlans();

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Planos de Preços</h1>
                <p className="text-slate-400">
                    Configure os valores e intervalos das assinaturas ativas na plataforma.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {plans.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        onSave={updatePlan}
                        isGlobalSaving={isSaving}
                    />
                ))}
            </div>
        </div>
    );
}
