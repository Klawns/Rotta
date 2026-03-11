"use client";

import { Check, Loader2, User as UserIcon, Phone, Ticket, CreditCard, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Plan {
    id: string;
    name: string;
    price: number;
    interval?: string;
    description: string;
    features: string[];
    cta: string;
    highlight: boolean;
}

export function CheckoutSelector() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [step, setStep] = useState<'plans' | 'fiscal'>('plans');
    const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

    // Fiscal Form State
    const [taxId, setTaxId] = useState(user?.taxId || "");
    const [cellphone, setCellphone] = useState(user?.cellphone || "");
    const [couponCode, setCouponCode] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadPlans() {
            try {
                const response = await api.get("/payments/plans");
                setPlans(response.data);
            } catch (error) {
                console.error("Erro ao carregar planos:", error);
            } finally {
                setIsLoading(false);
            }
        }
        loadPlans();
    }, []);

    const formatPrice = (priceInCents: number) => {
        if (priceInCents === 0) return "Grátis";
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(priceInCents / 100);
    };

    const handlePlanSelect = (planId: string) => {
        if (planId === 'starter') {
            router.push('/dashboard');
            return;
        }

        setSelectedPlanId(planId);

        // Se já tem dados fiscais, pula o form
        if (user?.taxId && user?.cellphone) {
            router.push(`/checkout?plan=${planId}`);
        } else {
            setStep('fiscal');
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
            // Após salvar, vai para o checkout real que agora é externo
            router.push(`/checkout?plan=${selectedPlanId}${couponCode ? `&coupon=${couponCode}` : ''}`);
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao salvar seus dados. Verifique os campos.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-lime-400 animate-spin" />
                <p className="mt-4 text-slate-400">Carregando planos disponíveis...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
                {step === 'plans' ? (
                    <motion.div
                        key="plans-step"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid lg:grid-cols-3 gap-8"
                    >
                        {plans.map((tier, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={cn(
                                    "p-10 rounded-3xl flex flex-col relative transition-all border",
                                    tier.highlight
                                        ? "bg-slate-900 border-lime-500/50 shadow-lime-500/5 shadow-2xl"
                                        : "bg-slate-900/50 border-white/5 hover:border-white/10"
                                )}
                            >
                                {tier.highlight && (
                                    <div className="absolute top-0 right-10 -translate-y-1/2 bg-lime-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                        Mais Popular
                                    </div>
                                )}

                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-slate-100 mb-2">{tier.name}</h3>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-white">{formatPrice(tier.price)}</span>
                                        {tier.interval && <span className="text-slate-500 text-sm">{tier.interval}</span>}
                                    </div>
                                    <p className="mt-4 text-slate-400 leading-relaxed text-sm">{tier.description}</p>
                                </div>

                                <ul className="space-y-4 mb-10 flex-grow">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex gap-3 text-slate-300 text-sm items-center">
                                            <Check size={16} className="text-lime-500 shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handlePlanSelect(tier.id)}
                                    className={cn(
                                        "w-full py-4 rounded-xl font-bold transition-all text-sm active:scale-[0.98]",
                                        tier.highlight
                                            ? "bg-lime-500 hover:bg-lime-400 text-black shadow-lg shadow-lime-500/20"
                                            : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                    )}
                                >
                                    {tier.cta}
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="fiscal-step"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="max-w-xl mx-auto w-full"
                    >
                        <div className="bg-slate-900 border border-white/10 rounded-3xl p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                            {/* Background accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 blur-3xl pointer-events-none" />

                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-12 h-12 bg-lime-500/20 rounded-2xl flex items-center justify-center">
                                    <CreditCard className="text-lime-400" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Dados da Assinatura</h2>
                                    <p className="text-slate-400 text-sm">Plano selecionado: <span className="text-lime-500 font-bold">{plans.find(p => p.id === selectedPlanId)?.name}</span></p>
                                </div>
                            </div>

                            <form onSubmit={handleSaveFiscalData} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="taxId" className="text-slate-300">CPF ou CNPJ</Label>
                                        <div className="relative">
                                            <UserIcon className="absolute left-3 top-3 text-slate-500" size={18} />
                                            <Input
                                                id="taxId"
                                                placeholder="000.000.000-00"
                                                value={taxId}
                                                onChange={(e) => setTaxId(e.target.value)}
                                                required
                                                className="bg-slate-950 border-white/5 pl-10 focus:border-lime-500/50 h-12"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cellphone" className="text-slate-300">WhatsApp / Celular</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 text-slate-500" size={18} />
                                            <Input
                                                id="cellphone"
                                                placeholder="(00) 00000-0000"
                                                value={cellphone}
                                                onChange={(e) => setCellphone(e.target.value)}
                                                required
                                                className="bg-slate-950 border-white/5 pl-10 focus:border-lime-500/50 h-12"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="coupon" className="text-slate-300">Cupom de Desconto (Opcional)</Label>
                                    <div className="relative">
                                        <Ticket className="absolute left-3 top-3 text-slate-500" size={18} />
                                        <Input
                                            id="coupon"
                                            placeholder="CÓDIGO"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            className="bg-slate-950 border-white/5 pl-10 focus:border-lime-500/50 h-12 font-mono"
                                        />
                                    </div>
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg border border-red-400/20">
                                        {error}
                                    </p>
                                )}

                                <div className="flex flex-col gap-3 pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="bg-lime-500 hover:bg-lime-400 text-black font-black h-14 rounded-2xl text-lg group"
                                    >
                                        {isSaving ? (
                                            <Loader2 className="animate-spin" />
                                        ) : (
                                            <>
                                                Gerar Pagamento Pix
                                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </Button>
                                    <button
                                        type="button"
                                        onClick={() => setStep('plans')}
                                        className="text-slate-500 hover:text-white text-sm transition-colors"
                                    >
                                        Voltar para planos
                                    </button>
                                </div>
                            </form>

                            <p className="mt-8 text-slate-500 text-[10px] text-center uppercase tracking-widest">
                                Ambiente seguro • AbacatePay • Pix Instantâneo
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
