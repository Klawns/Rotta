"use client";

import { useAuth } from "@/hooks/use-auth";
import { CheckoutSelector } from "@/components/dashboard/checkout-selector";
import { LogOut, Rocket, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PricingGatePage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 lg:p-24 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-lime-600/10 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-lime-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl w-full relative">
                <header className="text-center mb-16 space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/20 text-lime-400 text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <Rocket size={14} />
                        Upgrade de Conta
                    </motion.div>

                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight">
                        Evolua para o <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-500">
                            Nível Profissional
                        </span>
                    </h1>

                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Desbloqueie corridas ilimitadas, relatórios avançados e suporte prioritário.
                        Sua evolução como entregador de elite começa aqui.
                    </p>
                </header>

                {/* Mostra apenas os planos pagos para quem já está logado no starter */}
                <CheckoutSelector />

                <footer className="mt-20 flex flex-col items-center gap-6">
                    <div className="h-px w-24 bg-white/10" />

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar ao Dashboard
                        </button>

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-medium group"
                        >
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Sair da conta
                        </button>
                    </div>

                    <p className="text-slate-600 text-[10px] uppercase tracking-widest font-bold">
                        Pagamento processado com segurança via AbacatePay (Pix).
                    </p>
                </footer>
            </div>
        </div>
    );
}
