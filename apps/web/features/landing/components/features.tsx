"use client";

import { motion } from "framer-motion";
import { Shield, BarChart3, Zap, Smartphone, Globe, Lock, Bike, Users, Wallet, Sparkles } from "lucide-react";

const features = [
    {
        title: "Gestão de Corridas",
        description: "Registre cada entrega com precisão, controlando valores, taxas, quilometragem e horários em um só lugar.",
        icon: Bike,
        color: "text-violet-400",
        bg: "bg-violet-500/10"
    },
    {
        title: "Controle de Clientes",
        description: "Mantenha uma base organizada de seus clientes frequentes para agilizar o lançamento de novas corridas.",
        icon: Users,
        color: "text-emerald-400",
        bg: "bg-emerald-500/10"
    },
    {
        title: "Relatórios de Elite",
        description: "Visualize seu faturamento real, lucros líquidos e despesas operacionais com gráficos automáticos.",
        icon: BarChart3,
        color: "text-amber-400",
        bg: "bg-amber-500/10"
    },
    {
        title: "Centro de Comando",
        description: "Acompanhe sua produtividade diária e semanal através de um dashboard intuitivo e moderno.",
        icon: Shield,
        color: "text-blue-400",
        bg: "bg-blue-500/10"
    },
    {
        title: "Tutorial Integrado",
        description: "Domine cada recurso do sistema rapidamente com um guia passo-a-passo interativo.",
        icon: Sparkles,
        color: "text-indigo-400",
        bg: "bg-indigo-500/10"
    },
    {
        title: "Segurança na Nuvem",
        description: "Seus dados financeiros e de clientes estão sempre protegidos e acessíveis de qualquer lugar.",
        icon: Lock,
        color: "text-slate-400",
        bg: "bg-slate-500/10"
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 px-6 relative bg-[#020617] overflow-hidden">
            {/* Ambient background glow */}
            <div className="absolute top-1/4 -right-24 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-1/4 -left-24 w-96 h-96 bg-violet-600/10 blur-[120px] rounded-full" />

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight text-white uppercase italic">O Poder nas Suas Mãos</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
                        Funcionalidades reais, pensadas para o dia a dia do entregador profissional que busca controle total.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: idx * 0.05, duration: 0.5 }}
                            className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-8 lg:p-10 rounded-[2rem] flex flex-col group hover:border-blue-500/30 transition-all duration-500 relative h-full active:scale-[0.98]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem]" />

                            <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center ${feature.color} mb-8 group-hover:scale-110 transition-transform shadow-lg relative z-10 mr-auto`}>
                                <feature.icon size={28} />
                            </div>

                            <h3 className="text-xl font-black mb-4 text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight relative z-10">
                                {feature.title}
                            </h3>

                            <p className="text-slate-400 text-sm leading-relaxed font-medium relative z-10 group-hover:text-slate-300 transition-colors">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Optional Bottom Summary Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                    {[
                        { icon: Zap, label: "Interface Ultra Rápida" },
                        { icon: Smartphone, label: "Foco Mobile-First" },
                        { icon: Globe, label: "Multi-Dispositivo" },
                        { icon: Lock, label: "Criptografia de Elite" }
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-900/20 border border-white/5 py-6 px-4 rounded-2xl flex flex-col items-center text-center gap-3 hover:bg-slate-800/40 transition-all group">
                            <div className="text-blue-500/60 group-hover:text-blue-400 transition-colors"><item.icon size={20} /></div>
                            <span className="font-bold text-slate-400 tracking-widest uppercase text-[9px] group-hover:text-slate-200 transition-colors">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
