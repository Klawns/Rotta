import { Navbar } from "./components/navbar";
import { Hero } from "./components/hero";
import { Features } from "./components/features";
import { Pricing } from "./components/pricing";
import { Bike } from "lucide-react";
import "./styles/deep-night.css";

export default function LandingPage() {
    return (
        <main className="deep-night-bg">
            <Navbar />
            <Hero />
            <Features />
            <Pricing />
            <footer className="py-20 px-6 border-t border-white/5 bg-[#020617]">
                <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex flex-col items-center md:items-start gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-lime-500 rounded-lg flex items-center justify-center text-black">
                                <Bike size={16} />
                            </div>
                            <span className="text-2xl font-black text-white tracking-tighter">MDC</span>
                        </div>
                        <p className="text-slate-500 text-sm text-center md:text-left leading-relaxed">
                            © 2026 Mohamed Delivery Control.<br />A elite do gerenciamento para entregadores profissionais.
                        </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-10 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-lime-400 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-lime-400 transition-colors">Termos</a>
                        <a href="#" className="hover:text-lime-400 transition-colors">Suporte</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}
