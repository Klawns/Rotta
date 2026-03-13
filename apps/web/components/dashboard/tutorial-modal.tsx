"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Smartphone,
    MousePointer2,
    FileText,
    Sparkles,
    ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function TutorialModal({ isOpen, onClose }: TutorialModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                />

                {/* Modal Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden p-8 md:p-10"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>

                    <div className="space-y-6">
                        <header className="space-y-2">
                            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-3xl flex items-center justify-center mb-4">
                                <Sparkles size={32} />
                            </div>
                            <h2 className="text-3xl font-black text-white leading-tight">Bem-vindo ao Novo Rotta! 🚀</h2>
                            <p className="text-slate-400">Preparamos ferramentas incríveis para facilitar suas corridas.</p>
                        </header>

                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Notamos que você está explorando as novas funções de registro ágil e faturamento.
                                <span className="text-amber-400 font-bold ml-1">Para aproveitar ao máximo</span>, recomendamos ver nosso guia rápido.
                            </p>
                        </div>

                        <div className="flex flex-col gap-3 pt-4">
                            <Link href="/dashboard/tutorial" onClick={onClose} className="w-full">
                                <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-black h-14 rounded-2xl text-lg shadow-lg shadow-amber-500/20">
                                    Ver Tutorial Completo <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                            <button
                                onClick={onClose}
                                className="text-sm text-slate-500 hover:text-slate-300 font-medium py-2"
                            >
                                Já sei como usar
                            </button>
                        </div>
                    </div>

                    {/* Decorative element */}
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/10 blur-3xl rounded-full" />
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
