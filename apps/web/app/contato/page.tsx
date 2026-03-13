"use client";

import { motion } from "framer-motion";
import { MessageCircle, ArrowLeft, Zap, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ContactAccessPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements consistent with landing page */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 blur-[120px] rounded-full"></div>

                {/* Subtle Grid */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl z-10 text-center"
            >
                <div className="glass-card p-10 lg:p-16 rounded-[3rem] border border-white/10 shadow-2xl backdrop-blur-xl bg-slate-900/40 relative">
                    {/* Decorative Icons */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="w-20 h-20 relative overflow-hidden rounded-3xl mx-auto mb-8 shadow-xl shadow-blue-600/20"
                    >
                        <Image
                            src="/assets/logo8.jpg"
                            alt="Rotta Logo"
                            fill
                            className="object-cover"
                        />
                    </motion.div>

                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-6">
                        Liberação de <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                            Acesso Premium
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-md mx-auto font-medium">
                        Atualmente, estamos operando com ativações manuais para garantir o melhor suporte aos nossos primeiros clientes de elite.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 text-left">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Zap size={20} />
                            </div>
                            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Ativação Imediata</span>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
                                <Star size={20} />
                            </div>
                            <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">Suporte Direto</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                // Redirecionamento para o WhatsApp (exemplo)
                                window.open("https://wa.me/5599984073807?text=Olá! Quero ativar meu acesso premium no Rotta.", "_blank");
                            }}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-xl shadow-emerald-500/20 active:scale-[0.98] uppercase tracking-widest text-sm"
                        >
                            <MessageCircle size={22} className="fill-current" />
                            Falar com Administrador
                        </button>

                        <button
                            onClick={() => router.back()}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-bold py-5 rounded-2xl border border-white/10 transition-all flex items-center justify-center gap-2 group text-sm uppercase tracking-widest"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar
                        </button>
                    </div>

                    <p className="mt-12 text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">
                        Ambiente Seguro & Atendimento Personalizado
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
