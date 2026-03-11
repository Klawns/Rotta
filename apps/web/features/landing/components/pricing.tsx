"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import api from "@/services/api";

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

    // Se falhar ao carregar, não renderiza nada ou mostra erro
    if (plans.length === 0) return null;

    return (
        <section id="pricing" className="py-24 px-6">
            <div className="container mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-6">Investimento que se paga</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Escolha o plano que melhor se adapta à sua rotina de entregas. Comece grátis e evolua conforme cresce.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((tier, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "p-10 rounded-3xl flex flex-col relative transition-all border",
                                tier.highlight
                                    ? "bg-slate-900 border-lime-500/50 shadow-lime-500/10 shadow-2xl"
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
                                onClick={() => router.push(`/register?plan=${tier.id}`)}
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
                </div>
            </div>
        </section>
    );
}

