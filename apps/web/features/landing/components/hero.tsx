"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BarChart3, ArrowRight, MousePointer2, Smartphone, Globe } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
    const heroRef = useRef<HTMLDivElement>(null);

    // Smooth Tilt Effect logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-content > *", {
                y: 40,
                opacity: 0,
                duration: 1,
                stagger: 0.2,
                ease: "power4.out",
            });

            gsap.from(".hero-image-container", {
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
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-64 -mt-32" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full -ml-32 -mb-32" />

            <div className="container mx-auto flex flex-col lg:flex-row items-center gap-16 relative z-10">
                <div className="hero-content lg:w-1/2 text-left">
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.1]">
                        <span className="text-white">Gerencie suas</span>
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 glow-text">
                            corridas com maestria
                        </span>
                    </h1>

                    <p className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed font-medium">
                        A revolução no controle de entregas para quem busca agilidade, precisão e design de elite.
                        Otimize sua rota, controle ganhos e domine o asfalto.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/register?plan=starter"
                            className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all flex items-center justify-center gap-2 group shadow-xl shadow-blue-600/20 text-center active:scale-[0.98] uppercase tracking-widest text-sm"
                        >
                            Começar Agora
                            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black border border-white/10 transition-all text-center uppercase tracking-widest text-sm"
                        >
                            Acessar Conta
                        </Link>
                    </div>
                </div>

                <div className="lg:w-1/2 relative w-full h-[500px] md:h-[500px] lg:h-[600px] hero-image-container flex items-center justify-center">
                    {/* Layered Showcase - Responsive Scale */}
                    <div className="relative w-full max-w-[90%] h-full scale-[0.95] sm:scale-100 transition-transform duration-500">

                        {/* Central "Brilhozão" - Dynamic Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] -z-10 pointer-events-none overflow-visible">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-blue-600/30 blur-[140px] rounded-full animate-pulse" />
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] bg-indigo-500/20 blur-[100px] rounded-full opacity-60" />
                        </div>

                        {/* Desktop Print (Background) */}
                        <motion.div
                            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="absolute top-1/2 -translate-y-1/2 right-0 w-[95%] md:w-[100%] h-[75%] md:h-[80%] z-10"
                        >
                            <div className="relative w-full h-full glass-card rounded-[1.5rem] md:rounded-[2rem] p-1.5 md:p-2 shadow-2xl overflow-hidden">
                                <div className="relative w-full h-full rounded-[1rem] md:rounded-[1.5rem] overflow-hidden bg-slate-950">
                                    <Image
                                        src="/assets/dashboard2.png"
                                        alt="Desktop Dashboard View"
                                        fill
                                        className="object-cover object-top opacity-90"
                                        priority
                                    />
                                    {/* Subtle overlay for depth */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-transparent pointer-events-none" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Mobile Print (Foreground) */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, x: -40 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 1, delay: 0.3, ease: "backOut" }}
                            className="absolute top-[12%] md:top-[10%] lg:top-[calc(10%-45px)] left-[-20px] md:left-[-40px] lg:left-[calc(-10%-120px)] w-[45%] md:w-[42%] lg:w-[40%] h-[80%] md:h-full z-20 flex items-center"
                        >
                            <div className="relative w-full aspect-[9/18.5] p-2 bg-slate-900 border-[4px] md:border-[6px] border-slate-800 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.5)] lg:rotate-[-1deg]">
                                <div className="relative w-full h-full rounded-[1.6rem] md:rounded-[2rem] overflow-hidden bg-slate-950">
                                    <Image
                                        src="/assets/celular_dashbaord.png"
                                        alt="Mobile App Interface"
                                        fill
                                        className="object-cover"
                                    />
                                    {/* Notch for realism */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[35%] h-3 md:h-5 bg-slate-900 rounded-b-lg md:rounded-b-xl z-30" />

                                    {/* Screen glare */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                                </div>
                            </div>
                        </motion.div>

                        {/* Extra decorative blur beneath desktop */}
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[60%] h-[30%] bg-blue-600/10 blur-[60px] md:blur-[80px] -z-10 rounded-full" />
                    </div>
                </div>
            </div>
        </section>
    );
}
