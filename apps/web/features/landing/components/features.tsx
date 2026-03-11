"use client";

import { motion } from "framer-motion";
import { Shield, BarChart3, Zap, Smartphone, Globe, Lock } from "lucide-react";
import Image from "next/image";

const features = [
    {
        title: "Controle Total",
        description: "Gerencie cada entrega com precisão milimétrica e visibilidade 360º de sua operação.",
        icon: Shield,
        image: "/landing/mdc_feature_control_1772919113513.png",
    },
    {
        title: "Relatórios de Elite",
        description: "Transforme dados brutos em decisões estratégicas com dashboards automáticos e exportação em PDF.",
        icon: BarChart3,
        image: "/landing/mdc_feature_reports_1772919125580.png",
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 px-6 relative bg-[#020617]">
            <div className="container mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl lg:text-6xl font-black mb-6 tracking-tight text-white">Domínio Total do Asfalto</h2>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
                        Combinamos tecnologia aeroespacial com simplicidade operacional para que você foque no que importa: seu crescimento.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    {features.map((feature, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden flex flex-col group hover:border-lime-500/30 transition-all duration-500"
                        >
                            <div className="p-8 lg:p-12">
                                <div className="w-12 h-12 bg-lime-500/10 rounded-xl flex items-center justify-center text-lime-400 mb-6">
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-lime-400 transition-colors">{feature.title}</h3>
                                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                                    {feature.description}
                                </p>
                            </div>
                            <div className="relative h-64 lg:h-80 w-full overflow-hidden px-12">
                                <Image
                                    src={feature.image}
                                    alt={feature.title}
                                    fill
                                    className="object-contain object-bottom group-hover:scale-105 transition-transform duration-700"
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                    {[
                        { icon: Zap, label: "Velocidade Realtime" },
                        { icon: Smartphone, label: "App High-End" },
                        { icon: Globe, label: "Dados em Nuvem" },
                        { icon: Lock, label: "Criptografia Militar" }
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-900/40 border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center gap-4 hover:bg-slate-900/60 transition-colors">
                            <div className="text-lime-400 p-3 bg-lime-400/5 rounded-full"><item.icon size={28} /></div>
                            <span className="font-bold text-slate-200 tracking-tight">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
