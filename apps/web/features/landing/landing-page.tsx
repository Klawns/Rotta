"use client";

import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { Pricing } from "./components/pricing";
import { Bike } from "lucide-react";
import "./styles/deep-night.css";
import { useEffect } from "react";

export default function LandingPage() {
    useEffect(() => {
        // Implement smooth scroll to anchors
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId) {
                    const target = document.querySelector(targetId);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }, []);

    return (
        <main className="deep-night-bg selection:bg-blue-500/30 selection:text-white">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <footer className="py-20 px-6 border-t border-white/5 bg-[#020617] relative overflow-hidden">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full" />

                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-12 relative z-10">
                    <div className="flex flex-col items-center md:items-start gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                                <Bike size={20} />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter uppercase">MDC</span>
                        </div>
                        <p className="text-slate-500 text-sm text-center md:text-left leading-relaxed font-medium">
                            © 2026 Mohamed Delivery Control.<br />A elite do gerenciamento para entregadores profissionais.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-10 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        <a href="#" className="hover:text-blue-400 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Termos</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Suporte</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
