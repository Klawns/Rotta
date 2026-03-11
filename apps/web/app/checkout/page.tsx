"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CreditCard, Phone, User as UserIcon, Ticket } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CheckoutContent() {
    const { user, updateUser } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const planId = searchParams.get("plan");
    const [plans, setPlans] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);

    const [taxId, setTaxId] = useState("");
    const [cellphone, setCellphone] = useState("");
    const [couponCode, setCouponCode] = useState("");

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const response = await api.get("/payments/plans");
                setPlans(response.data);
            } catch (err) {
                console.error("Erro ao carregar planos:", err);
            } finally {
                setIsLoadingPlans(false);
            }
        };
        loadPlans();
    }, []);

    const selectedPlan = plans.find(p => p.id === planId);

    const createCheckout = async () => {
        if (!planId || planId === "starter") {
            router.push("/dashboard");
            return;
        }

        try {
            const response = await api.post("/payments/checkout", {
                plan: planId,
                couponCode: couponCode || undefined
            });
            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                setError("Não foi possível gerar o link de pagamento.");
            }
        } catch (err) {
            console.error("Erro ao criar checkout:", err);
            setError("Ocorreu um erro ao processar seu pedido. Tente novamente em instantes.");
        }
    };

    const handleSaveFiscalData = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await api.patch("/auth/profile", {
                taxId,
                cellphone
            });
            updateUser(response.data.user);
            setShowModal(false);
            // Após salvar, tenta criar o checkout novamente
            createCheckout();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao salvar seus dados. Verifique os campos.");
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (!user || isLoadingPlans) return;

        // Se o usuário já tem os dados, cria o checkout direto
        if (user.taxId && user.cellphone) {
            createCheckout();
        } else {
            // Se faltam dados, mostra o modal
            setTaxId(user.taxId || "");
            setCellphone(user.cellphone || "");
            setShowModal(true);
        }
    }, [user, planId, isLoadingPlans]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                {!error ? (
                    <>
                        <Loader2 className="w-12 h-12 text-lime-400 animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold text-white">Preparando seu {selectedPlan?.name || 'checkout'}...</h1>
                        <p className="text-slate-400">
                            {selectedPlan
                                ? `Você está assinando o ${selectedPlan.name} por ${formatCurrency(selectedPlan.price / 100)}${selectedPlan.interval || ''}.`
                                : "Aguarde enquanto preparamos os detalhes da sua assinatura."
                            }
                        </p>
                        <p className="text-xs text-slate-500 mt-4">
                            Estamos te redirecionando para o ambiente seguro de pagamento da AbacatePay.
                        </p>
                    </>
                ) : (
                    <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl space-y-4">
                        <h1 className="text-xl font-bold text-red-400">Ops! Algo deu errado</h1>
                        <p className="text-slate-300">{error}</p>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="bg-white text-black px-6 py-2 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                        >
                            Ir para o Dashboard
                        </button>
                    </div>
                )}
            </div>

            <Dialog open={showModal} onOpenChange={(open) => !isSaving && setShowModal(open)}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <CreditCard className="text-lime-400" size={24} />
                            Dados Fiscais
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Precisamos do seu CPF e celular para gerar a cobrança Pix no AbacatePay com segurança.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveFiscalData} className="space-y-4 mt-2">
                        <div className="space-y-2">
                            <Label htmlFor="taxId">CPF ou CNPJ</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-3 text-slate-500" size={18} />
                                <Input
                                    id="taxId"
                                    placeholder="000.000.000-00"
                                    value={taxId}
                                    onChange={(e) => setTaxId(e.target.value)}
                                    required
                                    className="bg-slate-950 border-white/5 pl-10 focus:ring-lime-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cellphone">Celular com DDD</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 text-slate-500" size={18} />
                                <Input
                                    id="cellphone"
                                    placeholder="(11) 99999-9999"
                                    value={cellphone}
                                    onChange={(e) => setCellphone(e.target.value)}
                                    required
                                    className="bg-slate-950 border-white/5 pl-10 focus:ring-lime-500/50"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pb-2 border-b border-white/5">
                            <Label htmlFor="coupon">Cupom de Desconto (Opcional)</Label>
                            <div className="relative">
                                <Ticket className="absolute left-3 top-3 text-slate-500" size={18} />
                                <Input
                                    id="coupon"
                                    placeholder="Tem um código?"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="bg-slate-950 border-white/5 pl-10 focus:ring-emerald-500/50 font-mono"
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 gap-2 flex-col sm:flex-row">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/dashboard")}
                                disabled={isSaving}
                                className="border-white/10 text-white hover:bg-white/5"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-lime-500 hover:bg-lime-400 text-black font-bold"
                            >
                                {isSaving ? "Salvando..." : "Prosseguir para Pagamento"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}


export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-lime-400 animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
