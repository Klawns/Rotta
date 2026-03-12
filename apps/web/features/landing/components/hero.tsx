"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { Shield, BarChart3, Zap, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-content > *", {
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power4.out",
            });

            gsap.from(".hero-image", {
                scale: 0.8,
                opacity: 0,
                duration: 1.5,
                delay: 0.5,
                ease: "power2.out",
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <section ref={heroRef} className="relative pt-32 pb-20 px-6 overflow-hidden">
            <div className="container mx-auto flex flex-col lg:flex-row items-center gap-12">
                <div className="hero-content lg:w-1/2 text-left z-10">

                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                        <span className="text-white">Gerencie suas</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 glow-text">
                            corridas com maestria
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed">
                        A revolução no controle de entregas para quem busca agilidade, precisão e design de elite.
                        Otimize sua rota, controle ganhos e domine o asfalto.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/register?plan=starter"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-600/20 text-center active:scale-[0.98]"
                        >
                            Começar Grátis
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold border border-white/10 transition-all text-center"
                        >
                            Acessar Minha Conta
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center gap-8 grayscale opacity-50">
                        {/* Mock de logos de confiança */}
                        <div className="h-6 w-24 bg-white/20 rounded"></div>
                        <div className="h-6 w-24 bg-white/20 rounded"></div>
                        <div className="h-6 w-24 bg-white/20 rounded"></div>
                    </div>
                </div>

                <div className="hero-image lg:w-1/2 relative">
                    <div className="relative z-10 rounded-2xl overflow-hidden glass-card p-2 animate-float">
                        <Image
                            src="/landing/mdc_hero_dashboard_1772919100605.png"
                            alt="MDC Dashboard"
                            width={800}
                            height={800}
                            className="rounded-xl shadow-2xl"
                            priority
                        />
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full"></div>
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-violet-500/20 blur-[100px] rounded-full"></div>
                </div>
            </div>
        </section>
    );
}
