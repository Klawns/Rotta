"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CheckoutContent() {
    const { user, updateUser } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const planId = searchParams.get("plan");
    const initialCoupon = searchParams.get("coupon") || "";

    const [plans, setPlans] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
    const [isLoadingPlans, setIsLoadingPlans] = useState(true);

    const [taxId, setTaxId] = useState("");
    const [cellphone, setCellphone] = useState("");
    const [couponCode, setCouponCode] = useState(initialCoupon);

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

    const createCheckout = async (currentCoupon?: string) => {
        if (!planId || planId === "starter") {
            router.push("/dashboard");
            return;
        }

        setIsCreatingCheckout(true);
        try {
            const response = await api.post("/payments/checkout", {
                plan: planId,
                couponCode: currentCoupon || couponCode || undefined
            });
            if (response.data.url) {
                window.location.href = response.data.url;
            } else {
                setError("Não foi possível gerar o link de pagamento.");
                setIsCreatingCheckout(false);
            }
        } catch (err: any) {
            console.error("Erro ao criar checkout:", err);
            const status = err.response?.status;
            if (status === 401) {
                setError("Sua sessão expirou. Por favor, faça login novamente para continuar.");
            } else {
                setError("Ocorreu um erro ao processar seu pedido. Tente novamente em instantes.");
            }
            setIsCreatingCheckout(false);
        }
    };

    const handleSaveFiscalData = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        try {
            const response = await api.patch("/auth/profile", {
                taxId,
                cellphone
            });
            updateUser(response.data.user);
            setShowModal(false);
            // Após salvar, tenta criar o checkout
            createCheckout();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao salvar seus dados. Verifique os campos.");
            setIsSaving(false);
        }
    };

    useEffect(() => {
        if (!user || isLoadingPlans || isCreatingCheckout || showModal || error) return;

        // Se o usuário já tem os dados, cria o checkout direto
        if (user.taxId && user.cellphone) {
            createCheckout();
        } else {
            // Se faltam dados, mostra o modal
            setTaxId(user.taxId || "");
            setCellphone(user.cellphone || "");
            setShowModal(true);
        }
    }, [user, planId, isLoadingPlans, error]);

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-lime-600/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-lime-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md w-full text-center space-y-8 relative z-10">
                {!error ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-lime-500/20 blur-2xl rounded-full" />
                            <Loader2 className="w-16 h-16 text-lime-400 animate-spin mx-auto relative" />
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                {selectedPlan ? `Assinando ${selectedPlan.name}` : 'Preparando checkout...'}
                            </h1>
                            <p className="text-slate-400 text-lg">
                                {selectedPlan
                                    ? `Total: ${formatCurrency(selectedPlan.price / 100)}${selectedPlan.interval || ''}`
                                    : "Aguarde um momento..."
                                }
                            </p>
                        </div>

                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm shadow-2xl">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Estamos te redirecionando para o ambiente seguro do <span className="text-lime-400 font-bold">AbacatePay</span> para concluir seu pagamento via Pix.
                            </p>
                        </div>

                        <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                            Ambiente Criptografado & Seguro
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-red-500/5 border border-red-500/20 p-10 rounded-[2.5rem] space-y-6 backdrop-blur-xl shadow-2xl"
                    >
                        <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <span className="text-red-500 text-2xl font-bold">!</span>
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-2xl font-bold text-white">Ops! Tivemos um problema</h1>
                            <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
                        </div>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    setError("");
                                    router.push("/pricing");
                                }}
                                className="w-full bg-white text-black h-14 rounded-2xl font-black hover:bg-slate-200 transition-all active:scale-[0.98] shadow-lg shadow-white/5"
                            >
                                Tentar Novamente
                            </button>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="w-full text-slate-500 hover:text-white text-sm font-medium transition-colors"
                            >
                                Ir para o Dashboard
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>

            <Dialog open={showModal} onOpenChange={(open) => !isSaving && setShowModal(open)}>
                <DialogContent className="bg-slate-900 border-white/10 text-white max-w-sm rounded-[2rem] p-8 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 blur-3xl pointer-events-none" />

                    <DialogHeader className="mb-6 relative z-10">
                        <DialogTitle className="text-2xl font-black flex items-center gap-3">
                            <div className="w-10 h-10 bg-lime-500/20 rounded-xl flex items-center justify-center">
                                <CreditCard className="text-lime-400" size={20} />
                            </div>
                            Dados Fiscais
                        </DialogTitle>
                        <DialogDescription className="text-slate-400 pt-2 font-medium">
                            O AbacatePay exige esses dados para emitir sua cobrança Pix com segurança.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSaveFiscalData} className="space-y-5 relative z-10">
                        <div className="space-y-2">
                            <Label htmlFor="taxId" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">CPF ou CNPJ</Label>
                            <div className="relative">
                                <UserIcon className="absolute left-4 top-4 text-slate-500" size={18} />
                                <Input
                                    id="taxId"
                                    placeholder="000.000.000-00"
                                    value={taxId}
                                    onChange={(e) => setTaxId(e.target.value)}
                                    required
                                    className="bg-slate-950 border-white/5 pl-12 h-14 rounded-2xl focus:ring-lime-500/50 text-white placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="cellphone" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">WhatsApp / Celular</Label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-4 text-slate-500" size={18} />
                                <Input
                                    id="cellphone"
                                    placeholder="(00) 00000-0000"
                                    value={cellphone}
                                    onChange={(e) => setCellphone(e.target.value)}
                                    required
                                    className="bg-slate-950 border-white/5 pl-12 h-14 rounded-2xl focus:ring-lime-500/50 text-white placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pb-2">
                            <Label htmlFor="coupon" className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Cupom (Opcional)</Label>
                            <div className="relative">
                                <Ticket className="absolute left-4 top-4 text-slate-500" size={18} />
                                <Input
                                    id="coupon"
                                    placeholder="CÓDIGO"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    className="bg-slate-950 border-white/5 pl-12 h-14 rounded-2xl focus:ring-emerald-500/50 font-mono tracking-widest text-emerald-400 placeholder:text-slate-700"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Button
                                type="submit"
                                disabled={isSaving}
                                className="bg-lime-500 hover:bg-lime-400 text-black font-black h-14 rounded-2xl text-lg transition-all active:scale-[0.98] shadow-lg shadow-lime-500/20"
                            >
                                {isSaving ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    "Confirmar e Pagar"
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => router.push("/pricing")}
                                disabled={isSaving}
                                className="text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl h-12"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-lime-400 animate-spin" />
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
