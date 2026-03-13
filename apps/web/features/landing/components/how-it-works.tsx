"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

export function HowItWorks() {
    const steps = [
        {
            num: "01",
            title: "Crie sua conta elite",
            desc: "Cadastre-se em segundos e tenha acesso ao centro de comando mais avançado para entregadores.",
        },
        {
            num: "02",
            title: "Registre suas Rotas",
            desc: "Adicione corridas com precisão cirúrgica: valores, taxas, quilometragem e horários.",
        },
        {
            num: "03",
            title: "Domine os Números",
            desc: "Visualize relatórios de elite com seus lucros reais e despesas em gráficos de alta performance.",
        },
        {
            num: "04",
            title: "Escale seus Ganhos",
            desc: "Use insights baseados em dados para otimizar seu tempo e faturar mais a cada dia.",
        },
    ];

    return (
        <section
            id="how-it-works"
            className="py-24 px-6 relative bg-[#020617] overflow-hidden"
        >
            {/* Ambient background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="container mx-auto relative z-10">
                <div className="text-center mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl lg:text-6xl font-black mb-6 tracking-tight text-white uppercase italic"
                    >
                        Como <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-500 glow-text">funciona</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-400 max-w-xl mx-auto text-lg leading-relaxed font-medium"
                    >
                        Controle total do asfalto em 4 passos estratégicos.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-8 relative">
                    {/* Connecting line (Desktop only) */}
                    <div
                        className="hidden lg:block absolute top-[44px] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"
                    />

                    {steps.map((s, i) => (
                        <StepItem key={i} step={s} index={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function StepItem({ step, index }: { step: { num: string; title: string; desc: string }, index: number }) {
    const ref = useRef(null);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
                duration: 0.8,
                delay: index * 0.15,
                ease: [0.21, 1.11, 0.81, 0.99] // Custom spring-like curve
            }}
            className="flex flex-col items-center text-center gap-6 group"
        >
            <div
                className="w-22 h-22 rounded-[1.5rem] flex items-center justify-center text-3xl font-black relative z-10 glass-card group-hover:border-blue-500/50 transition-all duration-500"
                style={{
                    background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)",
                }}
            >
                <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-violet-500 font-mono">
                    {step.num}
                </span>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-blue-500/10 blur-xl rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="space-y-3">
                <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                    {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed font-medium max-w-[240px] group-hover:text-slate-300 transition-colors">
                    {step.desc}
                </p>
            </div>
        </motion.div>
    );
}
