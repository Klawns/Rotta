"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

function RegisterContent() {
    const searchParams = useSearchParams();
    const plan = searchParams.get("plan") || "starter";

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-500/20 blur-[120px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md z-10"
            >
                <div className="auth-card p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-xl">
                    <div className="mb-8 text-center">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="inline-block p-1 rounded-2xl bg-blue-500/10 mb-4"
                        >
                            <div className="relative w-16 h-16 overflow-hidden rounded-xl shadow-lg shadow-blue-500/20">
                                <Image
                                    src="/assets/logo8.jpg"
                                    alt="Rotta Logo"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2">Bem-vindo ao Rotta</h1>
                        <p className="text-slate-400 text-balance">Acesse sua conta para gerenciar suas corridas com segurança</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => {
                                const isProd = typeof window !== 'undefined' && window.location.hostname !== 'localhost';
                                const baseUrl = isProd ? "/api/auth/google" : `${API_URL}/auth/google`;
                                window.location.href = `${baseUrl}?plan=${plan}`;
                            }}
                            className="w-full bg-white text-slate-950 hover:bg-slate-100 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-xl shadow-white/5"
                        >
                            <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={22} height={22} />
                            Cadastrar com Google
                        </button>

                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 text-center text-slate-400 text-sm">
                        Já tem uma conta?{" "}
                        <Link href="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">
                            Entrar agora
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-lime-400 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
