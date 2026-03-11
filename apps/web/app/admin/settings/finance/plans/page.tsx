"use client";

import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadPlans();
    }, []);

    async function loadPlans() {
        try {
            const { data } = await api.get("/admin/settings/plans");
            setPlans(data.map((p: any) => ({
                ...p,
                features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features
            })));
        } catch (error) {
            console.error("Erro ao carregar planos:", error);
            toast.error("Erro ao carregar planos");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleUpdatePlan(id: string, data: any) {
        setIsSaving(true);
        try {
            await api.patch(`/admin/settings/plans/${id}`, data);
            toast.success("Plano atualizado com sucesso!");
            loadPlans();
        } catch (error) {
            console.error("Erro ao atualizar plano:", error);
            toast.error("Erro ao atualizar plano");
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-500" size={32} /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white mb-2">Planos de Preços</h1>
                <p className="text-slate-400">Configure os valores e intervalos das assinaturas ativas na plataforma.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className="bg-slate-900/40 border-white/5">
                        <CardHeader>
                            <CardTitle className="text-white">{plan.name}</CardTitle>
                            <CardDescription>{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Preço (centavos)</Label>
                                <Input
                                    type="number"
                                    defaultValue={plan.price}
                                    onBlur={(e) => handleUpdatePlan(plan.id, { price: Number(e.target.value) })}
                                    className="bg-slate-950 border-white/10"
                                />
                                <p className="text-[10px] text-slate-500">Valor atual: {formatCurrency(plan.price / 100)}</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Intervalo</Label>
                                <Input
                                    defaultValue={plan.interval || ""}
                                    onBlur={(e) => handleUpdatePlan(plan.id, { interval: e.target.value })}
                                    placeholder="ex: /mês"
                                    className="bg-slate-950 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Destaque</Label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        defaultChecked={plan.highlight}
                                        onChange={(e) => handleUpdatePlan(plan.id, { highlight: e.target.checked })}
                                        className="w-4 h-4 rounded border-white/10 bg-slate-950"
                                    />
                                    <span className="text-sm text-slate-400">Mostrar como recomendado</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
