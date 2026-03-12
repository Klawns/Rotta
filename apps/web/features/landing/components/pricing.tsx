"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

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

export function Pricing() {
    const router = useRouter();
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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

    if (isLoading) {
        return (
            <section id="pricing" className="py-24 px-6">
                <div className="container mx-auto text-center">
                    <p className="text-slate-400">Carregando planos...</p>
                </div>
            </section>
        );
    }

    if (plans.length === 0) return null;

    return (
        <section id="pricing" className="py-24 px-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">Investimento que se paga</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Escolha o plano que melhor se adapta à sua rotina de entregas. Comece grátis e evolua conforme cresce.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
                    {plans.map((tier, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "p-10 rounded-[2.5rem] flex flex-col relative transition-all duration-500 border group",
                                tier.highlight
                                    ? "bg-slate-900 border-blue-500/50 shadow-blue-500/10 shadow-2xl lg:scale-110 z-10 py-16"
                                    : "bg-slate-900/40 backdrop-blur-sm border-white/5 hover:border-white/10"
                            )}
                        >
                            {tier.highlight && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl ring-4 ring-blue-600/20">
                                    Mais Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-100 mb-2 uppercase tracking-wide">{tier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black text-white">{formatPrice(tier.price)}</span>
                                    {tier.interval && <span className="text-slate-500 text-sm font-bold uppercase">{tier.interval}</span>}
                                </div>
                                <p className="mt-4 text-slate-400 leading-relaxed text-sm font-medium">{tier.description}</p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-grow">
                                {tier.features.map((feature, i) => (
                                    <li key={i} className="flex gap-3 text-slate-400 text-sm items-center group-hover:text-slate-200 transition-colors">
                                        <div className="h-5 w-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Check size={12} className="text-blue-400" />
                                        </div>
                                        <span className="font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => router.push(`/register?plan=${tier.id}`)}
                                className={cn(
                                    "w-full py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest active:scale-[0.95] shadow-lg",
                                    tier.highlight
                                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                                        : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                                )}
                            >
                                {tier.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
